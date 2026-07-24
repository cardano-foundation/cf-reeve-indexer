package org.cardanofoundation.reeve.indexer.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.cardanofoundation.reeve.indexer.config.CredentialSchema;
import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.config.KeriAgentIdentity;
import org.cardanofoundation.reeve.indexer.config.KeriProperties;
import org.cardanofoundation.reeve.indexer.model.domain.ceremony.CardCeremonyState;
import org.cardanofoundation.reeve.indexer.model.entity.CardAttestationCeremonyEntity;
import org.cardanofoundation.reeve.indexer.service.KeriNotificationCorrelator.CorrelatedNotification;
import org.cardanofoundation.reeve.indexer.service.KeriService.ValidatedPresentedCredential;
import org.cardanofoundation.signify.app.Exchanging.ExchangeMessageResult;
import org.cardanofoundation.signify.app.clienting.SignifyClient;
import org.cardanofoundation.signify.app.coring.Operation;
import org.cardanofoundation.signify.app.coring.Operations;
import org.cardanofoundation.signify.app.credentialing.ipex.IpexAdmitArgs;
import org.cardanofoundation.signify.app.credentialing.ipex.IpexAgreeArgs;
import org.cardanofoundation.signify.cesr.util.CESRStreamUtil;
import org.cardanofoundation.signify.core.States.HabState;

/**
 * Drives the "pair" and "credential presentation" steps of the card-attestation ceremony (design doc
 * Part A / A4), SYNCHRONOUSLY, in the request thread: {@link #pair} resolves the wallet's OOBI and
 * binds its AID to the ceremony; {@link #presentCredential} then runs the full IPEX apply -&gt;
 * offer/grant (dual-path) -&gt; agree -&gt; admit exchange against that wallet, fetches + validates the
 * presented credential chain, and records {@code credentialSaid}/{@code schemaSaid} on the ceremony.
 *
 * <p>Ported from the platform's {@code keri_attestation} module's {@code KeriCredentialService},
 * adapted to this app's single-agent, one-card-one-ceremony shape (no per-user identity link, no
 * {@code bindingVersion}/relink concept — the wallet AID and OOBI live directly on {@link
 * CardAttestationCeremonyEntity}, populated by {@link #pair}) and its plain-exception style (no
 * {@code vavr}, mirroring {@link CardCeremonyService}'s own javadoc): every step failure is isolated
 * behind {@link CardCredentialStepException}, caught once per public method, and turned into a {@link
 * CardCeremonyService#failStep} call — neither public method ever throws for a step-level failure; the
 * ceremony itself is always left in a terminal ({@code FAILED}) or successfully-advanced state before
 * returning. Only a caller-side usage error (unknown/expired/wrong-state ceremony, from {@link
 * CardCeremonyService#get}/{@link CardCeremonyService#beginStep}) or KERI being disabled entirely
 * propagates as a thrown exception.
 *
 * <p><b>Credential validation:</b> reuses WS1's schema-aware chained/standalone trust-check logic via
 * a new shared method, {@link KeriService#validatePresentedCredentialChain}, extracted from {@code
 * KeriService#verifyCredentialEntity} specifically for this purpose — {@code verifyCredentialEntity}
 * itself is unchanged in behavior (same schema gate, same trust checks, same order), just refactored
 * to share its parsing/trust-check internals with this new entry point. See that method's own javadoc
 * for exactly what is shared vs. what differs (schema discovery instead of a pre-known schema SAID;
 * an additional unconditional leaf-revocation check).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CardCredentialService {

    // KERIA surfaces an inbound IPEX exn's route on the notification as EITHER the "/exn/"-prefixed
    // form or the bare form, non-deterministically (ported observation from the platform's
    // KeriCredentialService). Accept both forms.
    private static final List<String> OFFER_ROUTES = List.of("/exn/ipex/offer", "/ipex/offer");
    private static final List<String> GRANT_ROUTES = List.of("/exn/ipex/grant", "/ipex/grant");

    /** Dual-path presentation: the initial post-apply wait (and the retry pre-check) must watch for
     *  EITHER an offer or a spontaneous grant, since a real Veridian wallet build was observed (on the
     *  platform reference this is ported from) to send the grant directly with no offer at all. {@link
     *  #isGrantRoute} then tells the two apart on the notification that actually arrives. */
    private static final List<String> OFFER_OR_GRANT_ROUTES =
            List.of("/exn/ipex/offer", "/ipex/offer", "/exn/ipex/grant", "/ipex/grant");

    /** KERI_DATETIME: rendered with exactly six fractional digits, matching the reference's own
     *  rationale — the pinned signify jar's null-datetime fallback can otherwise render without a
     *  fractional-seconds separator on a timestamp landing on an exact whole second, which a strict
     *  wallet-side schema check could reject outright. */
    private static final DateTimeFormatter KERI_DATETIME =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSS'+00:00'");

    /** Short wait for the retry pre-check — mirrors the reference's own retry-precheck timeout. */
    private static final Duration RETRY_PRECHECK_TIMEOUT = Duration.ofSeconds(2);

    /** Bounded wait for a single schema-OOBI resolve ({@link #ensureSchemasResolved}). */
    private static final long SCHEMA_RESOLVE_TIMEOUT_MILLIS = 15_000L;

    private final Optional<SignifyClient> client;
    private final Optional<KeriAgentIdentity> agentIdentity;
    private final CardAttestationOobiService oobiService;
    private final KeriNotificationCorrelator correlator;
    private final CardCeremonyService ceremonyService;
    private final CredentialSchemaRegistry credentialSchemaRegistry;
    private final KeriService keriService;
    private final KeriProperties keriProperties;
    @Value("${keri.enabled:false}")
    private boolean keriEnabled;

    /** In-memory cache of schema SAIDs whose {@code oobis()} have already been resolved on our agent
     *  this process ({@link #ensureSchemasResolved}) — mirrors the reference's own {@code
     *  resolvedSchemaSaids}: a schema, once resolved, stays resolved for the life of the agent. */
    private final Set<String> resolvedSchemaSaids = ConcurrentHashMap.newKeySet();

    /**
     * The "pair" step (design doc Part A / A4): resolves {@code walletOobiUrl} on the agent (validate
     * shape, resolve, verify it lands in {@code contacts()} — {@link
     * CardAttestationOobiService#resolveWalletOobi}) and, on success, binds the resulting wallet AID
     * and the OOBI URL itself to the ceremony, advancing {@code CREATED -&gt; PAIRED}.
     *
     * <p>No {@code retry} parameter (unlike {@link #presentCredential}): pairing is a single bounded
     * request/response round trip against our own agent, not an in-thread wait on a wallet reply, so
     * there is no "resume mid-wait" concern for a caller to opt into — a failed pair simply fails the
     * ceremony and a fresh {@code pair} call is not offered by this method (a new ceremony would be
     * created instead, per {@link CardCeremonyService#create}'s own javadoc on retried/abandoned
     * pairing attempts).
     *
     * @throws CardCeremonyNotFoundException no ceremony exists with {@code ceremonyId}
     * @throws CardCeremonyExpiredException the ceremony's TTL has elapsed
     * @throws CardCeremonyInvalidStateException the ceremony isn't in {@code CREATED}
     * @throws IllegalStateException KERI is disabled ({@code keri.enabled=false})
     * @return the ceremony's current state: {@code PAIRED} on success, {@code FAILED} (with {@code
     *         errorTitle}/{@code errorDetail} set) if the OOBI failed to resolve — never throws for a
     *         resolution failure, per this class's isolation contract.
     */
    public CardAttestationCeremonyEntity pair(UUID ceremonyId, String walletOobiUrl) {
        requireKeriEnabled();
        CardAttestationCeremonyEntity ceremony = ceremonyService.beginStep(ceremonyId, CardCeremonyState.CREATED,
                CardCeremonyState.CREATED, false);
        int generation = ceremony.getAttemptGeneration();

        String walletAid;
        try {
            walletAid = oobiService.resolveWalletOobi(walletOobiUrl);
        } catch (RuntimeException e) {
            log.warn("Failed to pair ceremony {} with wallet OOBI {}: {}", ceremonyId, walletOobiUrl, e.getMessage());
            ceremonyService.failStep(ceremonyId, generation, CardCeremonyState.CREATED, "PAIR_FAILED",
                    "Failed to resolve wallet OOBI: " + e.getMessage());
            return currentOrThrow(ceremonyId);
        }

        boolean completed = ceremonyService.completeStep(ceremonyId, generation, CardCeremonyState.CREATED,
                CardCeremonyState.PAIRED, c -> {
                    c.setWalletAid(walletAid);
                    c.setWalletOobiUrl(walletOobiUrl);
                });
        if (!completed) {
            log.warn("Ceremony {} was no longer waiting to be paired (concurrent retry?)", ceremonyId);
        }
        return currentOrThrow(ceremonyId);
    }

    /**
     * Orchestrates the credential-presentation step end-to-end, SYNCHRONOUSLY (design doc Part A /
     * A4): {@link #ensureSchemasResolved} -&gt; {@link CardCeremonyService#beginStep} from {@code
     * PAIRED} (a no-op transition on a first attempt, generation bump on retry — see that call's own
     * comment) -&gt; re-resolve the wallet OOBI (best-effort) -&gt; a short retry pre-check for a reply
     * that already arrived on a previous attempt's apply -&gt; apply -&gt; wait, in-thread, for EITHER
     * an offer or a spontaneous grant (dual-path) -&gt; branch: a grant admits directly; an offer falls
     * through to the negotiated flow (agree -&gt; wait for the grant -&gt; admit) -&gt; fetch the full
     * CESR chain -&gt; {@link KeriService#validatePresentedCredentialChain} -&gt; persist + complete the
     * step, advancing {@code PAIRED -&gt; CREDENTIAL_RECEIVED}.
     *
     * @throws CardCeremonyNotFoundException no ceremony exists with {@code ceremonyId}
     * @throws CardCeremonyExpiredException the ceremony's TTL has elapsed
     * @throws CardCeremonyInvalidStateException the ceremony isn't in (or, on retry, waiting on) {@code
     *         PAIRED}
     * @throws KeriAgentUnavailableException a configured schema's OOBI could not be resolved on the
     *         agent before the apply — surfaced as a plain problem, not a failed ceremony step (see
     *         {@link #ensureSchemasResolved}'s javadoc for why this check runs first)
     * @throws IllegalStateException KERI is disabled ({@code keri.enabled=false})
     * @return the ceremony's current state: {@code CREDENTIAL_RECEIVED} on success, {@code FAILED}
     *         (with {@code errorTitle}/{@code errorDetail} set) on any step failure — this method never
     *         throws for a step-level failure (a rejected/timed-out/malformed presentation), per this
     *         class's isolation contract.
     */
    public CardAttestationCeremonyEntity presentCredential(UUID ceremonyId, boolean retry) {
        requireKeriEnabled();
        // Live-testing fix (ported): resolved BEFORE beginStep touches any ceremony state at all — a
        // resolution failure here must surface as a plain KERI-agent-unavailable problem, not a
        // failed/rolled-back ceremony step. See this method's own javadoc.
        ensureSchemasResolved();

        CardAttestationCeremonyEntity ceremony = ceremonyService.beginStep(ceremonyId, CardCeremonyState.PAIRED,
                CardCeremonyState.PAIRED, retry);
        int generation = ceremony.getAttemptGeneration();

        // Carries the SAID of a claimed grant notification (set by doPresentCredential the moment one
        // is claimed, on EITHER dual-path branch) out to this method's own catch blocks below. The
        // agent's notification queue is shared across every ceremony/card: if a grant is claimed here
        // but the step then fails for ANY reason (rejected/malformed credential, a fetch failure, the
        // SAID-mismatch defense check, ...), the claim must still be undone — otherwise that
        // notification sits unread forever and the NEXT presentCredential call for ANY ceremony
        // re-claims the very same stale grant off the shared queue (awaitByRoute uses no
        // exclude-snapshot for offer/grant waits, and nothing else ever sweeps it), re-admits it, and
        // fails the same way — bricking the credential step agent-wide. See cleanupClaimedGrant.
        AtomicReference<String> claimedGrantNotificationId = new AtomicReference<>();

        try {
            return doPresentCredential(ceremony, generation, retry, claimedGrantNotificationId);
        } catch (CardCredentialStepException e) {
            log.warn("Credential presentation failed for ceremony {}: {} - {}", ceremonyId, e.title(), e.detail());
            ceremonyService.failStep(ceremonyId, generation, CardCeremonyState.PAIRED, e.title(), e.detail());
            cleanupClaimedGrant(claimedGrantNotificationId.get(), ceremonyId);
            return currentOrThrow(ceremonyId);
        } catch (RuntimeException e) {
            log.warn("Unexpected error presenting credential for ceremony {}: {}", ceremonyId, e.getMessage(), e);
            ceremonyService.failStep(ceremonyId, generation, CardCeremonyState.PAIRED, "CREDENTIAL_PRESENTATION_FAILED",
                    "Unexpected error: " + e.getMessage());
            cleanupClaimedGrant(claimedGrantNotificationId.get(), ceremonyId);
            return currentOrThrow(ceremonyId);
        }
    }

    /** Best-effort {@code markAndDelete} of a claimed grant notification AFTER the ceremony has
     *  reached a terminal state (here: {@code FAILED}, durably committed by the caller's own {@code
     *  failStep} just before this runs — mirrors the success path's own after-commit cleanup in {@link
     *  #doPresentCredential}). {@code null} (no grant was ever claimed on this attempt, e.g. the
     *  failure happened before/during the apply-wait) and any {@code RuntimeException} from the
     *  cleanup itself are both swallowed (logged) — this must never re-fail an already-FAILED ceremony,
     *  and a no-op here is safe because the failed attempt is the last consumer of {@code
     *  claimedGrantNotificationId} regardless. */
    private void cleanupClaimedGrant(String notificationId, UUID ceremonyId) {
        if (notificationId == null) {
            return;
        }
        try {
            correlator.markAndDelete(notificationId);
        } catch (RuntimeException e) {
            log.warn("Failed to mark/delete claimed grant notification {} for ceremony {} after failing the "
                    + "step (best-effort cleanup, ceremony is FAILED regardless): {}", notificationId, ceremonyId,
                    e.getMessage());
        }
    }

    // --- internals: presentCredential's actual wire flow, isolated behind CardCredentialStepException ---

    private CardAttestationCeremonyEntity doPresentCredential(CardAttestationCeremonyEntity ceremony, int generation,
            boolean retry, AtomicReference<String> claimedGrantNotificationId) {
        UUID ceremonyId = ceremony.getId();
        String walletAid = ceremony.getWalletAid();
        String walletOobiUrl = ceremony.getWalletOobiUrl();
        if (walletAid == null || walletAid.isBlank()) {
            throw new CardCredentialStepException("CREDENTIAL_PRESENTATION_FAILED",
                    "Ceremony %s has no paired wallet AID.".formatted(ceremonyId));
        }
        KeriAgentIdentity identity = agentIdentity.orElseThrow(() -> new CardCredentialStepException(
                "CREDENTIAL_PRESENTATION_FAILED", "KERI agent identity is not available."));
        String agentName = identity.name();

        // Re-resolve the wallet's OOBI before presenting: a contact resolved once at pairing can go
        // stale — refreshing it renews the wallet's key state/endpoints (and the agent's mailbox
        // relationship to it) so this ceremony's apply is both deliverable to the wallet and able to
        // receive the wallet's reply back. Best-effort, matching the reference: a refresh failure does
        // not block a presentation that may still succeed on the existing contact.
        if (walletOobiUrl != null && !walletOobiUrl.isBlank()) {
            try {
                log.info("re-resolving wallet OOBI before presentation (ceremony {}, aid {})", ceremonyId, walletAid);
                oobiService.refreshResolve(walletOobiUrl, walletAid);
            } catch (RuntimeException e) {
                log.warn("Wallet OOBI re-resolve failed for ceremony {} (proceeding best-effort): {}", ceremonyId,
                        e.getMessage());
            }
        }

        // Retry pre-check: before sending a fresh IPEX apply, look for a late-arriving offer OR grant
        // left over from a previous attempt (route-only — see KeriNotificationCorrelator's own
        // javadoc for why there is no further correlation check).
        CorrelatedNotification claimedNotification = null;
        if (retry && ceremony.getRequestExnSaid() != null) {
            claimedNotification = correlator.awaitByRoute(OFFER_OR_GRANT_ROUTES, RETRY_PRECHECK_TIMEOUT).orElse(null);
        }

        if (claimedNotification == null) {
            sendApply(ceremonyId, generation, walletAid, agentName);
            log.info("waiting for offer or grant on ceremony {} (routes {})", ceremonyId, OFFER_OR_GRANT_ROUTES);
            claimedNotification = correlator
                    .awaitByRoute(OFFER_OR_GRANT_ROUTES, keriProperties.getWalletResponseTimeout())
                    .orElseThrow(() -> new CardCredentialStepException("WALLET_TIMEOUT",
                            "Timed out waiting for /exn/ipex/offer or /exn/ipex/grant."));
        }

        // Dual-path branch: tell a spontaneous grant apart from a negotiated offer by the CLAIMED
        // notification's own route.
        String credentialSaid;
        String deferredGrantNotificationId;
        if (isGrantRoute(claimedNotification)) {
            log.info("grant received directly (spontaneous presentation) for ceremony {}, admitting {}", ceremonyId,
                    claimedNotification.exnSaid());
            // Claimed the INSTANT it's identified as a grant — every exit from here on (this branch's
            // own malformed-exn reject just below, a failed admit, or any later validation/persist
            // failure) must account for it; see claimedGrantNotificationId's own javadoc on
            // presentCredential for why an undeleted claim is agent-wide poison, not just a problem for
            // this one ceremony.
            claimedGrantNotificationId.set(claimedNotification.notificationId());
            String directCredentialSaid = extractCredentialSaid(claimedNotification.exn());
            if (directCredentialSaid == null) {
                throw new CardCredentialStepException("CREDENTIAL_PRESENTATION_FAILED",
                        "IPEX grant exchange did not embed an ACDC (e.acdc.d missing).");
            }
            // Verified finding (ported from the reference): submitAdmit is given the ADMIT's OWN atc
            // here (borrowedAtc = null), not an agree's — there is no agree in this branch to borrow
            // one from.
            admit(claimedNotification.exnSaid(), null, agentName, walletAid);
            credentialSaid = directCredentialSaid;
            deferredGrantNotificationId = claimedNotification.notificationId();
        } else {
            log.info("offer received for ceremony {}: {}", ceremonyId, claimedNotification.exnSaid());
            // Claimed (marked + deleted) immediately once its SAID has been read, before the agree is
            // even built — mirrors the reference. Best-effort: the offer notification carries no
            // information anything downstream still needs (unlike the grant's own id below, which must
            // survive a later failure for cleanup), so a transient KERIA failure here is logged and
            // swallowed rather than terminally failing an otherwise-good ceremony.
            try {
                correlator.markAndDelete(claimedNotification.notificationId());
            } catch (RuntimeException e) {
                log.warn("Failed to mark/delete offer notification {} for ceremony {} (proceeding "
                        + "best-effort): {}", claimedNotification.notificationId(), ceremonyId, e.getMessage());
            }

            ExchangeMessageResult agreeResult = sendAgree(claimedNotification.exnSaid(), agentName, walletAid);

            log.info("waiting for grant on ceremony {} (routes {})", ceremonyId, GRANT_ROUTES);
            CorrelatedNotification grantNotification = correlator
                    .awaitByRoute(GRANT_ROUTES, keriProperties.getWalletResponseTimeout())
                    .orElseThrow(() -> new CardCredentialStepException("WALLET_TIMEOUT",
                            "Timed out waiting for /exn/ipex/grant."));
            log.info("grant received for ceremony {}: {}", ceremonyId, grantNotification.exnSaid());
            // Claimed the INSTANT it's obtained — same rationale as the direct-grant branch above (this
            // is the actual grant, distinct from the offer already handled above).
            claimedGrantNotificationId.set(grantNotification.notificationId());

            String negotiatedCredentialSaid = extractCredentialSaid(grantNotification.exn());
            if (negotiatedCredentialSaid == null) {
                throw new CardCredentialStepException("CREDENTIAL_PRESENTATION_FAILED",
                        "IPEX grant exchange did not embed an ACDC (e.acdc.d missing).");
            }
            // submitAdmit is given the AGREE exchange's own atc, NOT the admit's own — a proven
            // wallet-contract quirk this module matches (ported from the reference).
            admit(grantNotification.exnSaid(), agreeResult.atc(), agentName, walletAid);
            credentialSaid = negotiatedCredentialSaid;
            deferredGrantNotificationId = grantNotification.notificationId();
        }

        ValidatedPresentedCredential validated = fetchAndValidateCredential(credentialSaid, walletAid, ceremonyId);

        // Defense-in-depth: the validator finds its leaf by issuee match, independently of the SAID
        // fetched the stream for — they must agree (mirrors the reference).
        if (!credentialSaid.equals(validated.credentialSaid())) {
            throw new CardCredentialStepException("CREDENTIAL_REJECTED",
                    "Validated leaf credential %s does not match the fetched credential %s."
                            .formatted(validated.credentialSaid(), credentialSaid));
        }
        log.info("credential validated {} (schema {}) for ceremony {}", validated.credentialSaid(),
                validated.schemaSaid(), ceremonyId);

        String finalCredentialSaid = validated.credentialSaid();
        String finalSchemaSaid = validated.schemaSaid();
        boolean completed = ceremonyService.completeStep(ceremonyId, generation, CardCeremonyState.PAIRED,
                CardCeremonyState.CREDENTIAL_RECEIVED, c -> {
                    c.setCredentialSaid(finalCredentialSaid);
                    c.setSchemaSaid(finalSchemaSaid);
                });
        if (!completed) {
            // Stale CAS (a concurrent retry superseded this attempt): the grant notification must be
            // left alone — the winning attempt's own wait is (or was) matching against the same
            // request.
            log.warn("Ceremony {} was no longer waiting on PAIRED when completing CREDENTIAL_RECEIVED "
                    + "(concurrent retry?)", ceremonyId);
            return currentOrThrow(ceremonyId);
        }
        log.info("credential step complete for ceremony {} (schema {})", ceremonyId, finalSchemaSaid);

        // Only after the ceremony transition is durably committed — an earlier mark-and-delete would
        // let a crash between the two silently lose the wallet's reply (KeriNotificationCorrelator's
        // own contract). A failure here is harmless best-effort cleanup: the ceremony has already
        // successfully advanced, so it must not be reported as a step failure.
        try {
            correlator.markAndDelete(deferredGrantNotificationId);
        } catch (RuntimeException e) {
            log.warn("Failed to mark/delete grant notification {} for ceremony {} (ceremony already "
                    + "completed successfully; harmless): {}", deferredGrantNotificationId, ceremonyId,
                    e.getMessage());
        }
        // Cleared regardless of the delete attempt's own outcome: the ceremony has durably committed
        // CREDENTIAL_RECEIVED either way, so this attempt is done with the claimed grant — clearing
        // prevents a spurious second cleanup attempt from presentCredential's catch blocks in the
        // freak case that something below (currentOrThrow) still throws.
        claimedGrantNotificationId.set(null);

        return currentOrThrow(ceremonyId);
    }

    /**
     * Live-testing fix (ported): resolves every configured credential schema's {@link
     * CredentialSchema#oobis()} on OUR OWN agent — not just recognized by the wallet — before an IPEX
     * apply referencing any schema is ever sent. KERIA silently drops an IPEX exchange referencing a
     * schema SAID the receiving agent has never itself resolved, so without this a real wallet's
     * "present" action does nothing observable (no error, no notification). Resolves ALL configured
     * schemas' OOBIs (not just the one this ceremony's own apply will request) since the dual-path
     * spontaneous-grant branch means a wallet may present ANY schema this agent is configured to
     * trust, not only the one requested.
     *
     * <p>Called at the very top of {@link #presentCredential}, before {@code beginStep} touches any
     * ceremony state at all: a resolution failure must surface as a plain problem ({@link
     * KeriAgentUnavailableException}), never a failed/rolled-back ceremony step.
     *
     * @throws KeriAgentUnavailableException a configured schema's OOBI could not be resolved
     */
    private void ensureSchemasResolved() {
        Collection<CredentialSchema> schemas = credentialSchemaRegistry.all();
        for (CredentialSchema schema : schemas) {
            String said = schema.said();
            if (said == null || said.isBlank() || resolvedSchemaSaids.contains(said)) {
                continue;
            }
            List<String> oobis = schema.oobis();
            if (oobis != null) {
                for (String oobi : oobis) {
                    if (oobi == null || oobi.isBlank()) {
                        continue;
                    }
                    try {
                        Object resolveResult = client.orElseThrow().oobis().resolve(oobi, null);
                        Operations.WaitOptions waitOptions = Operations.WaitOptions.builder()
                                .abortSignal(Operations.AbortSignal.builder().timeout(SCHEMA_RESOLVE_TIMEOUT_MILLIS).build())
                                .build();
                        client.orElseThrow().operations().wait(Operation.fromObject(resolveResult), waitOptions);
                    } catch (Exception e) {
                        interruptIfNeeded(e);
                        throw new KeriAgentUnavailableException(
                                "Failed to resolve schema OOBI %s (schema %s) on the agent: %s"
                                        .formatted(oobi, said, e.getMessage()), e);
                    }
                }
            }
            resolvedSchemaSaids.add(said);
        }
    }

    /** Builds and sends the IPEX apply for the FIRST configured credential schema (mirrors the
     *  reference's own {@code schemaSaids.get(0)}), persisting {@code requestExnSaid} before the send
     *  completes (the SAID is deterministic from the built, not-yet-sent exn) — read back by a LATER,
     *  separate retry's own pre-check. Wallet contract: {@code oobiUrl} is the credential SCHEMA
     *  SERVER's base URL ({@link KeriProperties#getCredentialSchemaOobiBaseUrl()}), NOT our agent's
     *  own OOBI — where a Veridian-style wallet actually resolves the schema behind the apply's SAID
     *  from, with a trailing slash. */
    private void sendApply(UUID ceremonyId, int generation, String walletAid, String agentName) {
        Collection<CredentialSchema> schemas = credentialSchemaRegistry.all();
        if (schemas.isEmpty()) {
            throw new CardCredentialStepException("CREDENTIAL_PRESENTATION_FAILED",
                    "No credential schemas configured under keri.credential-schemas.");
        }
        String schemaSaid = schemas.iterator().next().said();

        try {
            HabState sender = client.orElseThrow().identifiers().get(agentName)
                    .orElseThrow(() -> new CardCredentialStepException("CREDENTIAL_PRESENTATION_FAILED",
                            "No local HabState found for agent identifier %s.".formatted(agentName)));

            Map<String, Object> applyData = new LinkedHashMap<>();
            applyData.put("m", "");
            applyData.put("s", schemaSaid);
            applyData.put("a", new LinkedHashMap<>());
            applyData.put("oobiUrl", withTrailingSlash(keriProperties.getCredentialSchemaOobiBaseUrl()));
            ExchangeMessageResult applyResult = client.orElseThrow().exchanges().createExchangeMessage(sender,
                    "/ipex/apply", applyData, new LinkedHashMap<>(), walletAid, nowKeriTimestamp(), null);
            String exnSaid = (String) applyResult.exn().getKed().get("d");

            boolean persisted = ceremonyService.updateWaitingStepData(ceremonyId, generation, CardCeremonyState.PAIRED,
                    c -> c.setRequestExnSaid(exnSaid));
            if (!persisted) {
                throw new CardCredentialStepException("CREDENTIAL_PRESENTATION_FAILED",
                        "Ceremony %s is no longer waiting to present a credential.".formatted(ceremonyId));
            }

            Object applyOp = client.orElseThrow().ipex().submitApply(agentName, applyResult.exn(), applyResult.sigs(),
                    List.of(walletAid));
            client.orElseThrow().operations().wait(Operation.fromObject(applyOp));
            log.info("IPEX apply sent to {} for ceremony {} (schema {})", walletAid, ceremonyId, schemaSaid);
        } catch (CardCredentialStepException e) {
            throw e;
        } catch (Exception e) {
            interruptIfNeeded(e);
            throw new CardCredentialStepException("CREDENTIAL_PRESENTATION_FAILED",
                    "Failed to send IPEX apply: " + e.getMessage(), e);
        }
    }

    private ExchangeMessageResult sendAgree(String offerSaid, String agentName, String walletAid) {
        try {
            ExchangeMessageResult agreeResult = client.orElseThrow().ipex().agree(IpexAgreeArgs.builder()
                    .senderName(agentName).recipient(walletAid).message("")
                    .offerSaid(offerSaid).datetime(nowKeriTimestamp()).build());
            Object agreeOp = client.orElseThrow().ipex().submitAgree(agentName, agreeResult.exn(), agreeResult.sigs(),
                    List.of(walletAid));
            client.orElseThrow().operations().wait(Operation.fromObject(agreeOp));
            log.info("agree sent for grant to {}", walletAid);
            return agreeResult;
        } catch (Exception e) {
            interruptIfNeeded(e);
            throw new CardCredentialStepException("CREDENTIAL_PRESENTATION_FAILED",
                    "Failed to send IPEX agree: " + e.getMessage(), e);
        }
    }

    /** @param borrowedAtc {@code null} to use the admit's own atc (direct-grant branch); the agree
     *                     exchange's atc to borrow (negotiated branch) — see each call site. */
    private void admit(String grantSaid, String borrowedAtc, String agentName, String walletAid) {
        try {
            ExchangeMessageResult admitResult = client.orElseThrow().ipex().admit(IpexAdmitArgs.builder()
                    .senderName(agentName).recipient(walletAid).message("")
                    .grantSaid(grantSaid).datetime(nowKeriTimestamp()).build());
            String atc = borrowedAtc != null ? borrowedAtc : admitResult.atc();
            Object admitOp = client.orElseThrow().ipex().submitAdmit(agentName, admitResult.exn(), admitResult.sigs(),
                    atc, List.of(walletAid));
            client.orElseThrow().operations().wait(Operation.fromObject(admitOp));
            log.info("admit sent for grant {} to {}", grantSaid, walletAid);
        } catch (Exception e) {
            interruptIfNeeded(e);
            throw new CardCredentialStepException("CREDENTIAL_PRESENTATION_FAILED",
                    "Failed to admit IPEX grant: " + e.getMessage(), e);
        }
    }

    /** Fetches the credential's full CESR chain from the agent's store (post-admit) and validates it
     *  via {@link KeriService#validatePresentedCredentialChain} — see this class's own javadoc for how
     *  that reuses WS1's schema-aware trust-check logic. */
    private ValidatedPresentedCredential fetchAndValidateCredential(String credentialSaid, String walletAid,
            UUID ceremonyId) {
        String fullCesr;
        try {
            log.info("fetching credential CESR chain for {} (ceremony {})", credentialSaid, ceremonyId);
            fullCesr = client.orElseThrow().credentials().get(credentialSaid)
                    .orElseThrow(() -> new CardCredentialStepException("CREDENTIAL_PRESENTATION_FAILED",
                            "Credential %s was not found in the store after admit.".formatted(credentialSaid)));
            log.info("credential CESR chain fetched ({} chars) for ceremony {}", fullCesr.length(), ceremonyId);
        } catch (CardCredentialStepException e) {
            throw e;
        } catch (Exception e) {
            interruptIfNeeded(e);
            throw new CardCredentialStepException("CREDENTIAL_PRESENTATION_FAILED",
                    "Failed to fetch credential %s: %s".formatted(credentialSaid, e.getMessage()), e);
        }

        List<Map<String, Object>> cesrData = CESRStreamUtil.parseCESRData(fullCesr);
        return keriService.validatePresentedCredentialChain(walletAid, cesrData, "card ceremony " + ceremonyId)
                .orElseThrow(() -> new CardCredentialStepException("CREDENTIAL_REJECTED",
                        "Presented credential %s failed schema/trust validation.".formatted(credentialSaid)));
    }

    // --- small helpers ---

    private void requireKeriEnabled() {
        if (!keriEnabled) {
            throw new IllegalStateException("KERI is not enabled (keri.enabled=false)");
        }
    }

    private CardAttestationCeremonyEntity currentOrThrow(UUID ceremonyId) {
        return ceremonyService.get(ceremonyId)
                .orElseThrow(() -> new CardCeremonyNotFoundException("Ceremony %s was not found.".formatted(ceremonyId)));
    }

    /**
     * Dual-path branch decision: {@code notification} was claimed off the combined {@link
     * #OFFER_OR_GRANT_ROUTES} wait, so it is either an offer or a spontaneous grant. Prefers the
     * FETCHED exchange's own {@code r} field when it is itself a recognized offer/grant route; falls
     * back to the notification's own claimed route otherwise (ported from the reference).
     */
    private static boolean isGrantRoute(CorrelatedNotification notification) {
        Object exnRoute = notification.exn().get("r");
        String route = (exnRoute instanceof String s && (OFFER_ROUTES.contains(s) || GRANT_ROUTES.contains(s)))
                ? s
                : notification.claimedRoute();
        return route != null && GRANT_ROUTES.contains(route);
    }

    private static String extractCredentialSaid(Map<String, Object> grantExn) {
        Object e = grantExn.get("e");
        if (!(e instanceof Map<?, ?> em)) {
            return null;
        }
        Object acdc = em.get("acdc");
        if (!(acdc instanceof Map<?, ?> am)) {
            return null;
        }
        Object said = am.get("d");
        return said instanceof String s ? s : null;
    }

    private static void interruptIfNeeded(Exception e) {
        if (e instanceof InterruptedException) {
            Thread.currentThread().interrupt();
        }
    }

    private static String nowKeriTimestamp() {
        return KERI_DATETIME.format(LocalDateTime.now(ZoneOffset.UTC));
    }

    private static String withTrailingSlash(String url) {
        return url.endsWith("/") ? url : url + "/";
    }
}
