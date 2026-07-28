package org.cardanofoundation.reeve.indexer.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bloxbean.cardano.client.metadata.MetadataMap;

import org.cardanofoundation.reeve.indexer.config.KeriAgentIdentity;
import org.cardanofoundation.reeve.indexer.config.KeriProperties;
import org.cardanofoundation.reeve.indexer.model.domain.ceremony.CardCeremonyState;
import org.cardanofoundation.reeve.indexer.model.entity.CardAttestationCeremonyEntity;
import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;
import org.cardanofoundation.reeve.indexer.model.repository.IssuedCardRepository;
import org.cardanofoundation.reeve.indexer.service.KeriNotificationCorrelator.CorrelatedNotification;
import org.cardanofoundation.signify.app.Exchanging.ExchangeMessageResult;
import org.cardanofoundation.signify.app.clienting.SignifyClient;
import org.cardanofoundation.signify.app.coring.Operation;
import org.cardanofoundation.signify.app.coring.Operations;
import org.cardanofoundation.signify.core.States.HabState;

/**
 * Drives the final "ATTEST" step of the card-attestation ceremony (design doc Part A / A5),
 * SYNCHRONOUSLY, in the request thread — the same treatment {@link CardCredentialService#presentCredential}
 * gives credential presentation: freezes the card's canonical attestation digest ({@link
 * CardAttestationDigestFactory}), sends a remotesign anchoring request to the paired wallet AID, waits
 * IN-THREAD for the wallet's confirmed KEL interaction event, verifies it actually anchors the
 * expected digest, submits the on-chain CIP-170 label-170 {@code ATTEST} tx, and — only then — binds
 * the attestation onto the issued card row, all in {@link #attest}, the only public entry point.
 *
 * <p>Ported from the platform's ({@code cf-reeve-platform}) {@code keri_attestation} module's {@code
 * KeriAttestService}, targeting a CARD instead of a document/report: the KEL-floor / retry-precheck /
 * exclude-snapshot / re-resolve-before-KEL-read / seal-verification mechanics are unchanged, adapted
 * to this app's single-agent, one-card-one-ceremony shape (no per-user identity link — {@code
 * walletAid}/{@code walletOobiUrl} already live on {@link CardAttestationCeremonyEntity}, populated by
 * {@link CardCredentialService#pair}) and its plain-exception style (no {@code vavr}, mirroring {@link
 * CardCredentialService}'s own javadoc). This module ALSO does something the reference's {@code
 * KeriAttestService} does not: submits the on-chain CIP-170 {@code ATTEST} tx itself (via {@link
 * CardTxSubmitter}) once the anchor verifies, since — unlike the platform's document ceremony, where a
 * separate publish path anchors the already-on-chain document metadata — nothing else ever publishes
 * a card's attestation to Cardano.
 *
 * <p>Every UNRECOVERABLE step failure (a rejected/timed-out/mismatched wallet interaction, KERI being
 * unreachable, ...) is isolated behind {@link CardAttestStepException}, caught once in {@link
 * #attest}, and turned into a terminal {@link CardCeremonyService#failStep} call. A tx-submission
 * failure is deliberately handled differently (state-integrity fix, {@link #submitAndComplete}'s own
 * javadoc): the wallet anchor is durably persisted the moment it verifies, BEFORE tx submission is
 * ever attempted, so a submission failure leaves the ceremony at {@code CREDENTIAL_RECEIVED} —
 * recoverable, not {@code FAILED} — and a later {@link #attest} call resubmits the tx directly,
 * without repeating the (expensive, user-interactive) remotesign wallet round trip. {@link #attest}
 * never throws for either kind of step-level outcome.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CardAttestService {

    private static final List<String> REMOTESIGN_REF_ROUTES =
            List.of("/remotesign/ixn/ref", "/exn/remotesign/ixn/ref");
    private static final String REMOTESIGN_TOPIC = "remotesign";
    private static final String REMOTESIGN_REQUEST_ROUTE = "/remotesign/ixn/req";

    /** Short wait for the retry pre-check — mirrors the reference's own retry-precheck timeout (and
     *  {@link CardCredentialService#RETRY_PRECHECK_TIMEOUT}): deliberately much shorter than {@link
     *  KeriProperties#getWalletResponseTimeout()}, since this only catches a reply that arrived AFTER a
     *  previous attempt gave up but BEFORE the user hit retry. */
    private static final Duration RETRY_PRECHECK_TIMEOUT = Duration.ofSeconds(2);

    private static final int KEY_STATE_QUERY_ATTEMPTS = 5;
    private static final long KEY_STATE_QUERY_WAIT_MILLIS = 10_000L;
    private static final Duration KEY_STATE_RETRY_INITIAL_DELAY = Duration.ofSeconds(2);
    private static final Duration KEY_STATE_RETRY_INTERVAL = Duration.ofSeconds(3);

    /** See {@link CardCredentialService#KERI_DATETIME}'s javadoc for why this is passed explicitly
     *  rather than left to the pinned signify jar's own null-datetime fallback. */
    private static final DateTimeFormatter KERI_DATETIME =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSS'+00:00'");

    private final Optional<SignifyClient> client;
    private final Optional<KeriAgentIdentity> agentIdentity;
    private final CardAttestationOobiService oobiService;
    private final KeriNotificationCorrelator correlator;
    private final CardCeremonyService ceremonyService;
    private final Cip170MetadataFactory cip170MetadataFactory;
    private final RemotesignRequestFactory remotesignRequestFactory;
    private final CardAttestationDigestFactory digestFactory;
    private final Optional<CardTxSubmitter> txSubmitter;
    private final IssuedCardRepository issuedCardRepository;
    private final KeriProperties keriProperties;
    @Value("${keri.enabled:false}")
    private boolean keriEnabled;
    /** The CIP-170 metadata label the ATTEST tx (and this ceremony's remotesign payload) is published
     *  under — same property {@code ReeveMetadataStorage} reads back on-chain label-170 metadata with,
     *  so what this service submits is exactly what the rest of the indexer already knows how to read. */
    @Value("${keri.metadata-label:170}")
    private long metadataLabel;

    /**
     * Orchestrates the ATTEST step end-to-end, SYNCHRONOUSLY: {@link CardCeremonyService#beginStep}
     * from {@code CREDENTIAL_RECEIVED} (a no-op transition on a first attempt, generation bump on
     * retry) -&gt; a TX-ONLY RESUME check (see below) -&gt; compute the card's canonical digest -&gt; a
     * short retry pre-check for a late-arriving ref -&gt; query the wallet's current KEL sequence as a
     * FLOOR -&gt; snapshot outstanding remotesign-ref notifications (EXCLUDED from the wait below)
     * -&gt; build + saidify + send the remotesign request -&gt; wait IN-THREAD for the wallet's ref,
     * excluding the snapshot -&gt; re-resolve the wallet OOBI -&gt; locate the anchoring KEL event
     * (strictly after the floor, seal contains the payload SAID) -&gt; PERSIST the verified anchor
     * (durably, before ever attempting tx submission) -&gt; submit the label-170 ATTEST tx -&gt;
     * complete the step, advancing {@code CREDENTIAL_RECEIVED -&gt; ATTEST_ANCHORED} -&gt; bind the
     * attestation onto the issued card row.
     *
     * <p><b>Tx-only resume (state-integrity fix):</b> if a PRIOR attempt already verified the wallet's
     * anchor and durably persisted it ({@link CardAttestationCeremonyEntity#getKelSequence()} set) but
     * never got a successful tx submission ({@link CardAttestationCeremonyEntity#getTxHash()} still
     * {@code null} — a transient Blockfrost/backend failure, or a crash in between), THIS call skips
     * the entire wallet interaction (no new remotesign request, no wait) and goes straight to
     * resubmitting the tx from the persisted anchor. This check is unconditional — independent of the
     * {@code retry} flag — since the ceremony's own persisted fields are authoritative.
     *
     * @throws CardCeremonyNotFoundException no ceremony exists with {@code ceremonyId}
     * @throws CardCeremonyExpiredException the ceremony's TTL has elapsed
     * @throws CardCeremonyInvalidStateException the ceremony isn't in (or, on retry, waiting on)
     *         {@code CREDENTIAL_RECEIVED}
     * @throws IllegalStateException KERI is disabled ({@code keri.enabled=false})
     * @return the ceremony's current state: {@code ATTEST_ANCHORED} on success; {@code
     *         CREDENTIAL_RECEIVED} (with the anchor already verified/persisted but no {@code txHash}
     *         yet) if ONLY the on-chain tx submission failed — a subsequent {@link #attest} call
     *         resumes via the tx-only path above; {@code FAILED} (with {@code errorTitle}/{@code
     *         errorDetail} set) on any other, unrecoverable step failure. This method never throws for
     *         a step-level failure, per this class's isolation contract.
     */
    public CardAttestationCeremonyEntity attest(UUID ceremonyId, boolean retry) {
        requireKeriEnabled();
        CardAttestationCeremonyEntity ceremony = ceremonyService.beginStep(ceremonyId,
                CardCeremonyState.CREDENTIAL_RECEIVED, CardCeremonyState.CREDENTIAL_RECEIVED, retry);
        int generation = ceremony.getAttemptGeneration();

        try {
            return doAttest(ceremony, generation, retry);
        } catch (CardAttestStepException e) {
            log.warn("Attestation failed for ceremony {}: {} - {}", ceremonyId, e.title(), e.detail());
            ceremonyService.failStep(ceremonyId, generation, CardCeremonyState.CREDENTIAL_RECEIVED, e.title(),
                    e.detail());
            return currentOrThrow(ceremonyId);
        } catch (RuntimeException e) {
            log.warn("Unexpected error attesting ceremony {}: {}", ceremonyId, e.getMessage(), e);
            ceremonyService.failStep(ceremonyId, generation, CardCeremonyState.CREDENTIAL_RECEIVED, "ATTEST_FAILED",
                    "Unexpected error: " + e.getMessage());
            return currentOrThrow(ceremonyId);
        }
    }

    // --- internals: attest's actual wire flow, isolated behind CardAttestStepException ---

    private CardAttestationCeremonyEntity doAttest(CardAttestationCeremonyEntity ceremony, int generation,
            boolean retry) {
        UUID ceremonyId = ceremony.getId();
        String walletAid = ceremony.getWalletAid();
        String walletOobiUrl = ceremony.getWalletOobiUrl();
        if (walletAid == null || walletAid.isBlank()) {
            throw new CardAttestStepException("ATTEST_FAILED", "Ceremony %s has no paired wallet AID."
                    .formatted(ceremonyId));
        }

        IssuedCardEntity card = issuedCardRepository.findById(ceremony.getCardId())
                .orElseThrow(() -> new CardAttestStepException("ATTEST_FAILED",
                        "Card %s for ceremony %s was not found.".formatted(ceremony.getCardId(), ceremonyId)));

        // Fail fast (before ever touching the wallet) if no on-chain submitter is configured: without
        // this, a deployment that forgot keri.attestation.submitter.* would only find out AFTER driving
        // the full remotesign round trip (a real user interaction on the wallet side) — see
        // CardTxSubmitter's own javadoc for the config surface this is gated on.
        CardTxSubmitter submitter = txSubmitter.orElseThrow(() -> new CardAttestStepException(
                "ATTEST_SUBMITTER_UNAVAILABLE",
                "No CardTxSubmitter is configured (keri.attestation.submitter.enabled=false). "
                        + "DEPLOYMENT ACTION REQUIRED: this deployment must configure a funded organiser "
                        + "wallet mnemonic and a Blockfrost project id under keri.attestation.submitter.* "
                        + "before any card can be attested."));

        // Tx-only resume (state-integrity fix, see #attest's own javadoc): a PRIOR attempt already
        // verified the wallet's anchor and durably persisted it (kelSequence/kelEventSaid/cardDigest),
        // but never got a successful tx submission (txHash still null). Skip the ENTIRE wallet
        // interaction — no new remotesign request, no wait, no KEL read — and resubmit directly from
        // the persisted anchor. Checked UNCONDITIONALLY (independent of `retry`): the ceremony's own
        // persisted fields are authoritative, not the caller's belief about whether this is a "retry".
        if (ceremony.getKelSequence() != null && ceremony.getTxHash() == null) {
            String persistedDigest = ceremony.getCardDigest() != null ? ceremony.getCardDigest()
                    : digestFactory.digestOf(card);
            log.info("ceremony {} already has a verified anchor (seq={}) with no tx_hash yet — resubmitting the "
                    + "ATTEST tx without repeating the wallet interaction", ceremonyId, ceremony.getKelSequence());
            return submitAndComplete(ceremony, generation, ceremony.getKelSequence(), ceremony.getKelEventSaid(),
                    persistedDigest, card, submitter);
        }

        KeriAgentIdentity identity = agentIdentity.orElseThrow(() -> new CardAttestStepException("ATTEST_FAILED",
                "KERI agent identity is not available."));
        String agentName = identity.name();

        // The contract with the platform's future B2 import verification (CardAttestationDigestFactory's
        // own javadoc) — computed once per attempt, from the card row's CURRENT state, so a retry after
        // (hypothetically) differing card data always anchors what is actually being attested NOW.
        String cardDigestQb64 = digestFactory.digestOf(card);

        // Retry pre-check (ported): before re-sending, look for a late-arriving ref left over from a
        // previous attempt. Route-only (no exclude-snapshot possible here — the late ref being looked
        // for is itself pre-existing), so a claimed ref may be STALE DEBRIS rather than a genuine late
        // reply; it is resumed ONLY IF it actually anchors THIS ceremony's payload. A non-anchoring ref
        // must not fail the ceremony (that would loop forever on undeleted debris) — it falls through to
        // re-sending below.
        if (retry && ceremony.getRequestExnSaid() != null) {
            Optional<CorrelatedNotification> lateRef = correlator.awaitByRoute(REMOTESIGN_REF_ROUTES,
                    RETRY_PRECHECK_TIMEOUT);
            if (lateRef.isPresent()) {
                if (ceremony.getKelFloorSequence() == null) {
                    throw new CardAttestStepException("ATTEST_SEAL_MISMATCH", "no sequence floor recorded — re-attest");
                }
                Optional<Map<String, Object>> anchor = Optional.empty();
                try {
                    refreshWalletKeyState(walletAid, walletOobiUrl);
                    anchor = locateAnchoringEvent(walletAid, ceremony.getPayloadSaid(), ceremony.getKelFloorSequence(),
                            lateRef.get());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new CardAttestStepException("ATTEST_FAILED",
                            "Interrupted during the ATTEST retry pre-check.");
                } catch (Exception e) {
                    log.warn("retry pre-check verification errored for ceremony {}: {} — re-sending", ceremonyId,
                            e.getMessage());
                }
                if (anchor.isPresent()) {
                    log.info("remotesign ref received {} (late, resumed from retry) for ceremony {}",
                            lateRef.get().exnSaid(), ceremonyId);
                    return verifyAnchorAndSubmit(ceremony, generation, anchor.get(), lateRef.get(), cardDigestQb64,
                            card, submitter);
                }
                log.info("retry pre-check: a claimed ref did not anchor payload {} for ceremony {} — re-sending",
                        ceremony.getPayloadSaid(), ceremonyId);
            }
        }

        // Query the wallet's CURRENT KEL sequence and persist it as a floor BEFORE the remotesign
        // request is sent. Any accepted anchoring event must be strictly after this floor — without it,
        // an old KEL event that happens to carry the same digest (e.g. left over from a prior attestation
        // of identical card content) could satisfy a fresh request the wallet never actually acted on.
        Optional<String> floorSequenceOpt = queryLatestSequenceWithRetries(walletAid);
        if (floorSequenceOpt.isEmpty()) {
            throw new CardAttestStepException("ATTEST_FAILED",
                    "Failed to query the wallet's current KEL sequence to establish an anchor floor.");
        }
        String floorSequence = floorSequenceOpt.get();
        boolean floorPersisted = ceremonyService.updateWaitingStepData(ceremonyId, generation,
                CardCeremonyState.CREDENTIAL_RECEIVED, c -> c.setKelFloorSequence(floorSequence));
        if (!floorPersisted) {
            throw new CardAttestStepException("ATTEST_FAILED",
                    "Ceremony %s is no longer waiting to attest (concurrent retry?).".formatted(ceremonyId));
        }

        // Snapshot the remotesign-ref notifications already sitting in the agent's queue BEFORE sending
        // this request, so the wait below can EXCLUDE them: a leftover unread ref from an earlier
        // failed/timed-out attempt (never marked/deleted, since that only happens on success) must not be
        // claimed as THIS request's reply. Unlike CardCredentialService#presentCredential's IPEX
        // offer/grant wait — which is intentionally NOT given an exclude-snapshot, per that method's own
        // javadoc, because a dual-path spontaneous grant can legitimately race ahead of the correlator's
        // bookkeeping — this wait IS response-only (there is exactly one expected reply shape, the
        // remotesign ref), so exclude-snapshot is correct here.
        Set<String> preexistingRefs = correlator.outstandingNoteIds(REMOTESIGN_REF_ROUTES);

        String payloadSaid;
        try {
            HabState sender = client.orElseThrow().identifiers().get(agentName)
                    .orElseThrow(() -> new CardAttestStepException("ATTEST_FAILED",
                            "No local HabState found for agent identifier %s.".formatted(agentName)));

            Map<String, Object> ked = remotesignRequestFactory.anchorRequestKed(walletAid,
                    String.valueOf(metadataLabel), cardDigestQb64);
            payloadSaid = (String) ked.get("d");
            ExchangeMessageResult built = client.orElseThrow().exchanges().createExchangeMessage(sender,
                    REMOTESIGN_REQUEST_ROUTE, ked, Map.of(), walletAid, nowKeriTimestamp(), null);

            // Persist BEFORE the send completes: the SAID is deterministic from the built (not-yet-sent)
            // exn, matching CardCredentialService#sendApply's idiom.
            String requestExnSaid = (String) built.exn().getKed().get("d");
            boolean exnPersisted = ceremonyService.updateWaitingStepData(ceremonyId, generation,
                    CardCeremonyState.CREDENTIAL_RECEIVED, c -> {
                        c.setRequestExnSaid(requestExnSaid);
                        c.setPayloadSaid(payloadSaid);
                    });
            if (!exnPersisted) {
                throw new CardAttestStepException("ATTEST_FAILED",
                        "Ceremony %s is no longer waiting to attest (concurrent retry?).".formatted(ceremonyId));
            }

            client.orElseThrow().exchanges().sendFromEvents(agentName, REMOTESIGN_TOPIC, built.exn(), built.sigs(),
                    built.atc(), List.of(walletAid));
            log.info("remotesign request sent to {} for ceremony {}", walletAid, ceremonyId);
        } catch (CardAttestStepException e) {
            throw e;
        } catch (Exception e) {
            interruptIfNeeded(e);
            throw new CardAttestStepException("ATTEST_FAILED",
                    "Failed to send the ATTEST remotesign request: " + e.getMessage(), e);
        }

        log.info("waiting for remotesign ref (routes {}) for ceremony {}", REMOTESIGN_REF_ROUTES, ceremonyId);
        CorrelatedNotification ref = correlator
                .awaitByRoute(REMOTESIGN_REF_ROUTES, keriProperties.getWalletResponseTimeout(), preexistingRefs)
                .orElseThrow(() -> new CardAttestStepException("WALLET_TIMEOUT",
                        "Timed out waiting for the wallet's remotesign ref."));
        log.info("remotesign ref received {} for ceremony {}", ref.exnSaid(), ceremonyId);

        try {
            refreshWalletKeyState(walletAid, walletOobiUrl);
            Optional<Map<String, Object>> event = locateAnchoringEvent(walletAid, payloadSaid, floorSequence, ref);
            if (event.isEmpty()) {
                throw new CardAttestStepException("ATTEST_SEAL_MISMATCH",
                        ("No interaction (ixn) event strictly after the floor sequence and at or before the "
                                + "wallet's current key state anchored payload SAID %s (checked the wallet ref's "
                                + "explicit candidate and a bounded scan).").formatted(payloadSaid));
            }
            return verifyAnchorAndSubmit(ceremony, generation, event.get(), ref, cardDigestQb64, card, submitter);
        } catch (CardAttestStepException e) {
            throw e;
        } catch (Exception e) {
            interruptIfNeeded(e);
            throw new CardAttestStepException("ATTEST_SEAL_MISMATCH",
                    "Error verifying the wallet's anchor: " + e.getMessage(), e);
        }
    }

    /**
     * Re-resolves the paired wallet's OOBI on our agent right before its KEL is read (ported, cross-
     * KERIA stale-KEL fix — {@link CardAttestationOobiService#refreshResolve}). The wallet is on a
     * DIFFERENT KERIA by design, so our agent's view of its KEL can lag the ixn it just anchored in
     * response to the remotesign request; without this refresh, reading the KEL can miss that event and
     * fail {@code ATTEST_SEAL_MISMATCH} even though the wallet DID sign. Best-effort, matching {@link
     * CardCredentialService}'s own pre-presentation re-resolve: a failure is logged and the read
     * proceeds on whatever state the agent already has.
     */
    private void refreshWalletKeyState(String walletAid, String walletOobiUrl) {
        if (walletOobiUrl == null || walletOobiUrl.isBlank()) {
            return;
        }
        try {
            log.info("re-resolving wallet OOBI before reading its KEL (aid {})", walletAid);
            oobiService.refreshResolve(walletOobiUrl, walletAid);
        } catch (RuntimeException e) {
            log.warn("Wallet OOBI re-resolve before KEL read failed for aid {} (proceeding best-effort on "
                    + "current state): {}", walletAid, e.getMessage());
        }
    }

    /**
     * From a correlated ref, locates the wallet KEL interaction (ixn) event that anchors {@code
     * payloadSaid} strictly after {@code floorSequence} (ported verbatim from the platform's {@code
     * KeriAttestService#locateAnchoringEvent}): honors the ref's explicit anchoring-event candidate if
     * it has one (no fallback to a scan once a candidate is on the table — a candidate that can't be
     * found must fail, not shop for a different event), otherwise falls back to a BOUNDED scan of
     * {@code ixn} events up to the wallet's current key state. Empty when none verifies. Pure (no
     * ceremony side effects) — the retry pre-check relies on that to decide whether a claimed ref is
     * genuinely this ceremony's anchor before acting on it.
     */
    private Optional<Map<String, Object>> locateAnchoringEvent(String walletAid, String payloadSaid,
            String floorSequence, CorrelatedNotification ref) throws Exception {
        AnchorCandidate candidate = extractCandidate(ref.exn());
        List<Map<String, Object>> kel = fetchKel(walletAid);
        List<Map<String, Object>> ixnEvents = kel.stream().filter(ke -> "ixn".equals(ke.get("t"))).toList();
        if (!candidate.isEmpty()) {
            Map<String, Object> event = locateExplicitCandidate(ixnEvents, candidate);
            return event != null && satisfiesFloorAndDigest(event, floorSequence, payloadSaid)
                    ? Optional.of(event) : Optional.empty();
        }
        return queryLatestSequenceWithRetries(walletAid)
                .map(cs -> scanForSealMatch(ixnEvents, floorSequence, cs, payloadSaid));
    }

    /**
     * From a freshly verified anchoring {@code event}: PERSISTS the anchor (kelSequence/kelEventSaid/
     * cardDigest) durably on the ceremony row BEFORE ever attempting tx submission (state-integrity
     * fix — see {@link #attest}'s own javadoc), then marks the ref notification consumed (its job is
     * done the instant the anchor is durably captured — a resumed tx-only attempt never needs it
     * again), then hands off to {@link #submitAndComplete} for the (independently retryable) tx
     * submission.
     */
    private CardAttestationCeremonyEntity verifyAnchorAndSubmit(CardAttestationCeremonyEntity ceremony,
            int generation, Map<String, Object> event, CorrelatedNotification ref, String cardDigestQb64,
            IssuedCardEntity card, CardTxSubmitter submitter) {
        UUID ceremonyId = ceremony.getId();
        String sequence = String.valueOf(event.get("s"));
        String eventSaid = String.valueOf(event.get("d"));
        log.info("anchor verified for ceremony {}: seq={}, eventSaid={}", ceremonyId, sequence, eventSaid);

        boolean anchorPersisted = ceremonyService.updateWaitingStepData(ceremonyId, generation,
                CardCeremonyState.CREDENTIAL_RECEIVED, c -> {
                    c.setKelSequence(sequence);
                    c.setKelEventSaid(eventSaid);
                    c.setCardDigest(cardDigestQb64);
                });
        if (!anchorPersisted) {
            // A concurrent retry superseded this attempt — leave the ref alone (the winning attempt's
            // own wait may still need it) and report the ceremony's current (by-then-authoritative)
            // state, mirroring this class's other CAS-miss handling.
            log.warn("Ceremony {} was no longer waiting on CREDENTIAL_RECEIVED when persisting the verified "
                    + "anchor (concurrent retry?)", ceremonyId);
            return currentOrThrow(ceremonyId);
        }

        // Best-effort: a failure here is harmless — the anchor itself is already durably safe on the
        // ceremony row, so an undeleted notification costs nothing (unlike CardCredentialService's own
        // grant-notification handling, nothing downstream ever re-claims a remotesign ref by route
        // alone in a way that would matter once the anchor is persisted).
        try {
            correlator.markAndDelete(ref.notificationId());
        } catch (RuntimeException e) {
            log.warn("Failed to mark/delete remotesign ref notification {} for ceremony {} (anchor already "
                    + "durably persisted; harmless): {}", ref.notificationId(), ceremonyId, e.getMessage());
        }

        return submitAndComplete(ceremony, generation, sequence, eventSaid, cardDigestQb64, card, submitter);
    }

    /**
     * Submits the on-chain CIP-170 label-170 {@code ATTEST} tx ({@code t=ATTEST, s=sequence,
     * i=walletAid, d=cardDigestQb64}) from an ALREADY-VERIFIED, durably persisted anchor — either
     * just-verified by {@link #verifyAnchorAndSubmit}, or read back off the ceremony row by {@link
     * #doAttest}'s tx-only resume check — and, only on success, completes the step (persisting {@code
     * txHash} on the ceremony row ALONGSIDE {@code sequence}/{@code eventSaid} in the same mutator, so
     * the ceremony is the single authoritative record of a real broadcast tx) and binds the card.
     *
     * <p><b>Deliberately does NOT fail the ceremony on a tx-submission error</b> (state-integrity fix):
     * a {@link CardTxSubmissionException} is logged and this returns the ceremony's CURRENT state —
     * still {@code CREDENTIAL_RECEIVED}, with the anchor already durably persisted — instead of
     * throwing {@link CardAttestStepException} (which {@link #attest} would turn into a terminal
     * {@code failStep}). That is what makes tx submission independently retryable without redoing the
     * (expensive, user-interactive) remotesign wallet round trip: the NEXT {@link #attest} call, for
     * ANY value of its {@code retry} argument, detects the persisted-but-unsubmitted anchor via {@link
     * #doAttest}'s resume check and calls straight back into this method.
     *
     * <p><b>Known follow-up (out of scope here):</b> nothing currently sweeps a ceremony stuck in this
     * "anchor verified, tx not yet submitted" state if the CALLER never retries (e.g. abandoned after
     * a submission failure) — unlike {@code CardCeremonyService}'s own TTL-based lazy expiry, which
     * still applies (the ceremony expires like any other non-terminal one), there is no active
     * reconciliation/resubmission sweep. Concurrent {@code attest()} calls for the SAME ceremony could
     * also both observe "no submitter tx_hash yet" and double-submit; the {@code (state,
     * attemptGeneration)} CAS does not protect this window since neither read here changes state or
     * generation. Both are acceptable for this task's scope but worth a dedicated fix if this ceremony
     * sees real concurrent/abandoned-retry traffic.
     */
    private CardAttestationCeremonyEntity submitAndComplete(CardAttestationCeremonyEntity ceremony, int generation,
            String sequence, String eventSaid, String cardDigestQb64, IssuedCardEntity card,
            CardTxSubmitter submitter) {
        UUID ceremonyId = ceremony.getId();
        String walletAid = ceremony.getWalletAid();

        String txHash;
        try {
            MetadataMap attestMetadata = cip170MetadataFactory.attestMap(walletAid, cardDigestQb64, sequence);
            txHash = submitter.submitMetadataTransaction(metadataLabel, attestMetadata);
        } catch (CardTxSubmissionException e) {
            log.warn("CIP-170 ATTEST tx submission failed for ceremony {} (anchor already verified and durably "
                    + "persisted — a later attest() call retries ONLY the submission, not the wallet "
                    + "interaction): {}", ceremonyId, e.getMessage());
            return currentOrThrow(ceremonyId);
        }
        log.info("CIP-170 ATTEST tx submitted for ceremony {}: txHash={}", ceremonyId, txHash);

        boolean completed = ceremonyService.completeStep(ceremonyId, generation, CardCeremonyState.CREDENTIAL_RECEIVED,
                CardCeremonyState.ATTEST_ANCHORED, c -> {
                    c.setKelSequence(sequence);
                    c.setKelEventSaid(eventSaid);
                    c.setTxHash(txHash);
                });
        if (!completed) {
            log.warn("Ceremony {} was no longer waiting on CREDENTIAL_RECEIVED when completing ATTEST_ANCHORED "
                    + "(concurrent retry?) — on-chain tx {} was already submitted regardless.", ceremonyId, txHash);
            return currentOrThrow(ceremonyId);
        }
        log.info("attest step complete for ceremony {}", ceremonyId);

        bindCardAttestation(ceremony, card, txHash);
        return currentOrThrow(ceremonyId);
    }

    /**
     * Binds the now-complete attestation onto {@link IssuedCardEntity} (design doc Part A / A5, the
     * card-format contract) so {@code CardIssuanceService#toCardJson}/{@code exportCard} emit the
     * {@code attestation} block from here on. Best-effort AFTER the ceremony has already durably
     * advanced to {@code ATTEST_ANCHORED}: a failure here is logged but must NEVER re-fail an
     * already-successful ceremony (matching this class's own isolation contract). Fully recoverable if
     * it fails: {@code walletOobiUrl}/{@code walletAid}/{@code credentialSaid}/{@code schemaSaid} were
     * already durably persisted on the ceremony row well before this point, and — since the
     * state-integrity fix — {@code txHash} now IS TOO ({@link CardAttestationCeremonyEntity#getTxHash()},
     * set in the very same {@code completeStep} mutator that advanced the ceremony here), so a manual
     * (or future automated) reconciliation can always re-derive the exact card update from the
     * ceremony row alone, with no data lost even if this save never runs at all.
     *
     * <p><b>The attestation fields written here are CLAIMS, not verified facts.</b> The indexer
     * accepts whatever credential the paired wallet presents without checking its schema, issuer,
     * trust chain or revocation state ({@code KeriService#readPresentedCredential}), so {@code
     * attestationCredentialSaid}/{@code attestationSchemaSaid} record only what was presented. A
     * consumer that needs them to MEAN something must verify the credential itself — that is the
     * platform's B2 import verifier's job, and {@code attestationCredentialCesr} is carried on the
     * card precisely so it can. Do not reintroduce an assumption of trustworthiness here.
     */
    private void bindCardAttestation(CardAttestationCeremonyEntity ceremony, IssuedCardEntity card, String txHash) {
        String credentialCesr = fetchCredentialCesr(ceremony);
        try {
            card.setAttestationOobi(ceremony.getWalletOobiUrl());
            card.setAttestationAid(ceremony.getWalletAid());
            card.setAttestationCredentialSaid(ceremony.getCredentialSaid());
            card.setAttestationSchemaSaid(ceremony.getSchemaSaid());
            card.setAttestationTxHash(txHash);
            card.setAttestationCredentialCesr(credentialCesr);
            issuedCardRepository.save(card);
            log.info("card {} bound to attestation (ceremony {}, tx {})", card.getCardId(), ceremony.getId(), txHash);
        } catch (RuntimeException e) {
            log.warn("Failed to bind attestation onto card {} for ceremony {} (the ceremony row's own tx_hash "
                    + "column already durably holds {} — fully recoverable from there; the card row itself was "
                    + "not updated by this attempt): {}", card.getCardId(), ceremony.getId(), txHash,
                    e.getMessage());
        }
    }

    /**
     * Re-fetches the presented credential's full CESR chain from the agent store (still present
     * post-admit), so {@code toCardJson} can carry it on the exported card for the platform's B2
     * import verification — which can resolve the AID's OOBI but cannot fetch this credential itself.
     * Best-effort: a fetch failure (or KERI disabled / no credentialSaid) leaves it {@code null}; the
     * card still binds the rest of the attestation, and the CESR stays re-derivable from the ceremony's
     * {@code credentialSaid} — it must never re-fail an already-successful ceremony (this class's
     * isolation contract).
     */
    private String fetchCredentialCesr(CardAttestationCeremonyEntity ceremony) {
        String credentialSaid = ceremony.getCredentialSaid();
        if (credentialSaid == null || credentialSaid.isBlank() || client.isEmpty()) {
            return null;
        }
        try {
            return client.get().credentials().get(credentialSaid).orElse(null);
        } catch (Exception e) {
            interruptIfNeeded(e);
            log.warn("Failed to fetch credential CESR {} for ceremony {} (card bound WITHOUT it — the importer "
                    + "cannot re-validate the credential until it is re-derived from the ceremony's "
                    + "credentialSaid): {}", credentialSaid, ceremony.getId(), e.getMessage());
            return null;
        }
    }

    // --- candidate extraction from the ref exn payload (ported verbatim) ---

    /** A candidate anchoring-event locator learned from the wallet's ref exn (or, failing that, a
     *  key-state query fallback) — either field may be {@code null} if unavailable. */
    private record AnchorCandidate(String said, String sequence) {
        private static final AnchorCandidate EMPTY = new AnchorCandidate(null, null);

        boolean isEmpty() {
            return said == null && sequence == null;
        }
    }

    @SuppressWarnings("unchecked")
    private static AnchorCandidate extractCandidate(Map<String, Object> exn) {
        Object a = exn.get("a");
        if (!(a instanceof Map<?, ?> payload)) {
            return AnchorCandidate.EMPTY;
        }
        Object said = ((Map<String, Object>) payload).get("d");
        Object sequence = ((Map<String, Object>) payload).get("s");
        return new AnchorCandidate(said instanceof String s ? s : null,
                sequence != null ? String.valueOf(sequence) : null);
    }

    // --- key-state fallback: bounded retries confirming KEL availability (ported verbatim) ---

    private Optional<String> queryLatestSequenceWithRetries(String aid) {
        Duration delay = KEY_STATE_RETRY_INITIAL_DELAY;
        for (int attempt = 1; attempt <= KEY_STATE_QUERY_ATTEMPTS; attempt++) {
            try {
                Object raw = client.orElseThrow().keyStates().query(aid, null);
                Operation<Object> op = client.orElseThrow().operations().wait(Operation.fromObject(raw),
                        boundedKeyStateWait());
                Object response = op.getResponse();
                if (response instanceof Map<?, ?> map) {
                    Object sn = map.get("s");
                    if (sn != null) {
                        return Optional.of(String.valueOf(sn));
                    }
                }
            } catch (Exception e) {
                log.warn("Key-state query attempt {}/{} for AID {} failed: {}", attempt, KEY_STATE_QUERY_ATTEMPTS,
                        aid, e.getMessage());
            }
            if (attempt < KEY_STATE_QUERY_ATTEMPTS) {
                try {
                    Thread.sleep(delay.toMillis());
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return Optional.empty();
                }
                delay = KEY_STATE_RETRY_INTERVAL;
            }
        }
        return Optional.empty();
    }

    private static Operations.WaitOptions boundedKeyStateWait() {
        return Operations.WaitOptions.builder()
                .abortSignal(Operations.AbortSignal.builder().timeout(KEY_STATE_QUERY_WAIT_MILLIS).build())
                .build();
    }

    // --- KEL fetch + anchoring-event location, over the pinned jar's raw Object shapes (ported verbatim) ---

    private List<Map<String, Object>> fetchKel(String aid) throws Exception {
        Object raw = client.orElseThrow().keyEvents().get(aid);
        if (!(raw instanceof List<?> rawList)) {
            return List.of();
        }
        List<Map<String, Object>> events = new ArrayList<>();
        for (Object item : rawList) {
            Map<String, Object> ked = extractKed(item);
            if (ked != null) {
                events.add(ked);
            }
        }
        return events;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> extractKed(Object item) {
        if (!(item instanceof Map<?, ?> map)) {
            return null;
        }
        Object ked = map.get("ked");
        if (ked instanceof Map<?, ?>) {
            return (Map<String, Object>) ked;
        }
        // Defensive fallback: some KERIA responses may not wrap events under "ked" — if this item
        // already looks like a key event itself (has a type and sequence), use it directly.
        if (map.containsKey("t") && map.containsKey("s")) {
            return (Map<String, Object>) map;
        }
        return null;
    }

    /** Locates the {@code ixn} event an explicit ref-derived {@code candidate} names — by SAID first,
     *  then by sequence (no fallback to "the latest event" if neither matches). */
    private static Map<String, Object> locateExplicitCandidate(List<Map<String, Object>> ixnEvents,
            AnchorCandidate candidate) {
        if (candidate.said() != null) {
            for (Map<String, Object> ke : ixnEvents) {
                if (candidate.said().equals(ke.get("d"))) {
                    return ke;
                }
            }
        }
        if (candidate.sequence() != null) {
            for (Map<String, Object> ke : ixnEvents) {
                if (candidate.sequence().equals(String.valueOf(ke.get("s")))) {
                    return ke;
                }
            }
        }
        return null;
    }

    /** Bounded scan over {@code ixnEvents} whose sequence falls within ({@code floorSequence}, {@code
     *  currentSequence}] — STRICTLY after the floor, at or before the current key-state sequence
     *  (hex-compared numerically) — returning the first whose seal contains {@code payloadSaid}. */
    private static Map<String, Object> scanForSealMatch(List<Map<String, Object>> ixnEvents, String floorSequence,
            String currentSequence, String payloadSaid) {
        long floor = parseHexSequence(floorSequence);
        long current = parseHexSequence(currentSequence);
        for (Map<String, Object> ke : ixnEvents) {
            long sn = parseHexSequence(String.valueOf(ke.get("s")));
            if (sn <= floor || sn > current) {
                continue;
            }
            if (sealContainsDigest(ke.get("a"), payloadSaid)) {
                return ke;
            }
        }
        return null;
    }

    /** {@code event}'s sequence must be STRICTLY after {@code floorSequence} AND its seal must contain
     *  {@code payloadSaid}. Sequence equal to the floor is rejected: the floor is the sequence observed
     *  before the request was sent, so the genuine anchoring event is always strictly newer. */
    private static boolean satisfiesFloorAndDigest(Map<String, Object> event, String floorSequence,
            String payloadSaid) {
        long sn = parseHexSequence(String.valueOf(event.get("s")));
        if (sn <= parseHexSequence(floorSequence)) {
            return false;
        }
        return sealContainsDigest(event.get("a"), payloadSaid);
    }

    private static long parseHexSequence(String hexSequence) {
        return Long.parseLong(hexSequence, 16);
    }

    private static boolean sealContainsDigest(Object sealField, String digestQb64) {
        if (!(sealField instanceof List<?> seals) || digestQb64 == null) {
            return false;
        }
        for (Object seal : seals) {
            if (seal instanceof Map<?, ?> sealMap && digestQb64.equals(sealMap.get("d"))) {
                return true;
            }
        }
        return false;
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

    private static void interruptIfNeeded(Exception e) {
        if (e instanceof InterruptedException) {
            Thread.currentThread().interrupt();
        }
    }

    private static String nowKeriTimestamp() {
        return KERI_DATETIME.format(LocalDateTime.now(ZoneOffset.UTC));
    }
}
