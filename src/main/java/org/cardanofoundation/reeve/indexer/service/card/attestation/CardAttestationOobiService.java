package org.cardanofoundation.reeve.indexer.service.card.attestation;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.cardanofoundation.reeve.indexer.config.KeriAgentIdentity;
import org.cardanofoundation.reeve.indexer.service.keri.KeriAgentUnavailableException;
import org.cardanofoundation.reeve.indexer.service.keri.KeriOobiValidationException;
import org.cardanofoundation.signify.app.clienting.SignifyClient;
import org.cardanofoundation.signify.app.coring.Operations;
import org.cardanofoundation.signify.exception.OperationTimeoutException;
import org.cardanofoundation.signify.exception.SignifyAgentException;
import org.cardanofoundation.signify.exception.SignifyTransportException;
import org.cardanofoundation.signify.generated.keria.model.OOBI;

/**
 * The "pair" foundation for the card-attestation ceremony: exposes the indexer's own KERI agent OOBI
 * (for a Veridian wallet to resolve) and resolves a wallet's OOBI on the agent (validating shape,
 * resolving, and verifying the AID lands in {@code contacts()}).
 *
 * <p>Single-agent, no-per-user-identity-link shape: there is no {@code userId}/{@code
 * KeriIdentityLinkEntity} concept here, so {@link #resolveWalletOobi} resolves and verifies without
 * any persistence, and {@link #refreshResolve} is its re-resolve-only counterpart (needed later,
 * right before reading the wallet's KEL — a contact resolved once at pairing can go stale). This
 * service is not gated by a conditional bean (mirrors {@code KeriService}'s existing convention in
 * this app): it always exists, but every public method fails fast via {@link #requireKeriEnabled()}
 * when {@code keri.enabled=false} rather than the whole context refusing to start.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CardAttestationOobiService {

    private static final String AGENT_ROLE = "agent";
    static final int MAX_OOBI_URL_LENGTH = 2048;
    private static final long RESOLVE_TIMEOUT_MILLIS = 15_000L;
    private static final Pattern OOBI_AID_PATTERN = Pattern.compile("/oobi/([^/]+)");

    private final Optional<SignifyClient> client;
    private final Optional<KeriAgentIdentity> agentIdentity;
    @Value("${keri.enabled:false}")
    private boolean keriEnabled;

    private volatile String cachedAgentOobi;

    /**
     * Caches the agent's own OOBI eagerly ("fail at startup, not on first request"). By the time this
     * runs (when {@code keri.enabled}), {@link KeriAgentIdentity} has already been created/looked up
     * by {@code KeriConfig#keriAgentIdentity}, since that bean is a required upstream dependency of
     * this one.
     */
    @PostConstruct
    void init() throws Exception {
        if (!keriEnabled) {
            log.info("KERI is not enabled; skipping agent OOBI bootstrap.");
            return;
        }
        KeriAgentIdentity identity = agentIdentity.orElseThrow(
                () -> new IllegalStateException("KERI agent identity bean is not available"));
        cachedAgentOobi = fetchAgentOobi(identity);
        log.info("KERI agent {} ({}) OOBI: {}", identity.name(), identity.prefix(), cachedAgentOobi);
    }

    /**
     * The indexer's own agent OOBI URL — hand this to a Veridian wallet so it can resolve/pair with
     * this agent.
     */
    public String getAgentOobi() {
        requireKeriEnabled();
        if (cachedAgentOobi == null) {
            throw new IllegalStateException("KERI agent OOBI was not resolved at startup");
        }
        return cachedAgentOobi;
    }

    /**
     * Validates {@code oobiUrl}'s shape, resolves it on the agent, and confirms the AID it
     * identifies lands in {@code contacts()} — the "pair" step of the ceremony. No persistence: the
     * caller is responsible for remembering the returned AID.
     *
     * @return the wallet AID extracted from {@code oobiUrl}
     * @throws KeriOobiValidationException the OOBI URL/AID is malformed, or was never verified as a
     *         contact after resolving
     * @throws KeriAgentUnavailableException the KERI agent was transiently unreachable
     */
    public String resolveWalletOobi(String oobiUrl) {
        requireKeriEnabled();
        String aid = validate(oobiUrl);
        resolveAndVerify(oobiUrl, aid);
        return aid;
    }

    /**
     * Re-resolves an ALREADY-known wallet AID's OOBI on the agent, refreshing the wallet's key
     * state/endpoints (and the agent's mailbox relationship to it), without any persistence side
     * effects. Intended to be called right before reading the wallet's KEL (a contact resolved once
     * at pairing can go stale — the wallet rotates keys, re-hosts, or its KERIA endpoints change).
     * Same resolve+verify core as {@link #resolveWalletOobi}, just against an {@code aid} the
     * caller already trusts rather than one freshly extracted from {@code oobiUrl}.
     *
     * @throws KeriOobiValidationException {@code oobiUrl} is malformed, or {@code aid} never
     *         verified as a contact after resolving
     * @throws KeriAgentUnavailableException the KERI agent was transiently unreachable
     */
    public void refreshResolve(String oobiUrl, String aid) {
        requireKeriEnabled();
        validate(oobiUrl);
        resolveAndVerify(oobiUrl, aid);
    }

    private void requireKeriEnabled() {
        if (!keriEnabled) {
            throw new IllegalStateException("KERI is not enabled (keri.enabled=false)");
        }
    }

    /**
     * {@code client.oobis().get(name, "agent")} returns an {@code OOBI} whose {@code oobis} list holds
     * the URLs for the agent's end role. Indexes the first entry
     * directly rather than stringifying the whole list (a legacy idiom elsewhere in this ecosystem
     * silently concatenates every entry when there's more than one witness-visible OOBI) — this is
     * well-defined for both the common single-entry case and the multi-entry one.
     */
    private String fetchAgentOobi(KeriAgentIdentity identity) throws Exception {
        OOBI oobi = client.orElseThrow().oobis().get(identity.name(), AGENT_ROLE)
                .orElseThrow(() -> new IllegalStateException(
                        "No OOBI available for KERI agent identifier " + identity.name()));
        List<String> oobis = oobi.getOobis();
        if (oobis == null || oobis.isEmpty()) {
            throw new IllegalStateException(
                    "KERI agent OOBI response contained no oobis for identifier " + identity.name());
        }
        return oobis.get(0);
    }

    // --- validation: runs before any client call, so an invalid URL never touches the KERI agent ---

    private static String validate(String oobiUrl) {
        if (oobiUrl == null || oobiUrl.isBlank()) {
            throw new KeriOobiValidationException("OOBI URL must not be blank.");
        }
        if (oobiUrl.length() > MAX_OOBI_URL_LENGTH) {
            throw new KeriOobiValidationException(
                    "OOBI URL exceeds the maximum length of %d characters.".formatted(MAX_OOBI_URL_LENGTH));
        }
        URI uri;
        try {
            uri = new URI(oobiUrl);
        } catch (URISyntaxException e) {
            throw new KeriOobiValidationException(
                    "OOBI URL is not a syntactically valid URL: %s".formatted(e.getMessage()));
        }
        if (!"https".equalsIgnoreCase(uri.getScheme())) {
            throw new KeriOobiValidationException("OOBI URL must use the https scheme.");
        }
        Matcher matcher = OOBI_AID_PATTERN.matcher(oobiUrl);
        if (!matcher.find() || matcher.group(1).isBlank()) {
            throw new KeriOobiValidationException("OOBI URL must contain a non-empty /oobi/{aid} path segment.");
        }
        return matcher.group(1);
    }

    // --- resolve against the KERI agent and verify the AID landed in contacts ---

    private void resolveAndVerify(String oobiUrl, String aid) {
        try {
            var resolveResult = client.orElseThrow().oobis().resolve(oobiUrl, aid);
            Operations.WaitOptions waitOptions = Operations.WaitOptions.builder()
                    .abortSignal(Operations.AbortSignal.builder().timeout(RESOLVE_TIMEOUT_MILLIS).build())
                    .build();
            client.orElseThrow().operations().wait(resolveResult, waitOptions);

            var contact = client.orElseThrow().contacts().get(aid);
            if (contact.isEmpty()) {
                throw new KeriOobiValidationException(
                        "AID %s could not be verified via contacts after resolving the OOBI.".formatted(aid));
            }
        } catch (KeriOobiValidationException | KeriAgentUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.warn("OOBI resolve failed for AID {} ({}): {}", aid, oobiUrl, e.getMessage());
            if (isTransientAgentFailure(e)) {
                throw new KeriAgentUnavailableException(
                        "The KERI agent is temporarily unreachable; please try again. (%s)".formatted(e.getMessage()), e);
            }
            throw new KeriOobiValidationException("Failed to resolve OOBI URL: %s".formatted(e.getMessage()), e);
        }
    }

    /**
     * Distinguishes a KERI agent that is merely unreachable or momentarily broken from an OOBI/AID
     * that genuinely does not check out, so a KERIA outage never gets reported to the caller as
     * "your OOBI URL is invalid" ({@link KeriOobiValidationException}). Classified as transient
     * ({@link KeriAgentUnavailableException}):
     * <ul>
     *   <li>any {@link IOException} — connection-refused, connect/request timeouts, and every other
     *       network-level transport failure the JDK {@code HttpClient} used under {@code
     *       SignifyClient#fetch} can raise;</li>
     *   <li>{@link SignifyTransportException} — the client's own wrapper for the same transport
     *       failures, which it now raises unchecked;</li>
     *   <li>{@link OperationTimeoutException} — the resolve wait's abort signal (bounded by
     *       {@link #RESOLVE_TIMEOUT_MILLIS}) fired: the agent accepted the request but the
     *       long-running operation never completed in time;</li>
     *   <li>an {@link InterruptedException} whose message contains "timeout", which is how the same
     *       condition surfaced before the client raised a dedicated type;</li>
     *   <li>{@link SignifyAgentException} carrying a 5xx status — the agent responded, but with a
     *       server-side error rather than a rejection of the request.</li>
     * </ul>
     * Everything else (a plain non-timeout {@code InterruptedException}, a 4xx status, and the
     * empty-contact case handled separately above) stays {@link KeriOobiValidationException}: the
     * agent was reachable and the resolution completed, it just didn't produce a usable AID.
     *
     * <p>The 5xx test now reads {@link SignifyAgentException#getStatusCode()} instead of regex-ing the
     * status back out of the exception's message. The message format was never a contract, and a
     * client-side rewording of it would have silently turned every agent outage into "your OOBI URL is
     * invalid".
     */
    private static boolean isTransientAgentFailure(Throwable e) {
        if (e instanceof IOException || e instanceof SignifyTransportException
                || e instanceof OperationTimeoutException) {
            return true;
        }
        if (e instanceof InterruptedException) {
            return containsIgnoreCase(e.getMessage(), "timeout");
        }
        if (e instanceof SignifyAgentException agentError) {
            int status = agentError.getStatusCode();
            return status >= 500 && status < 600;
        }
        return false;
    }

    private static boolean containsIgnoreCase(String message, String needle) {
        return message != null && message.toLowerCase(Locale.ROOT).contains(needle);
    }

}
