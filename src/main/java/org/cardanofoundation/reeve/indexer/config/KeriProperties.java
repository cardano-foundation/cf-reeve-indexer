package org.cardanofoundation.reeve.indexer.config;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "keri")
@Data
public class KeriProperties {
    private String url;
    private String bootUrl;

    /**
     * The indexer's own KERI agent passcode ("bran"). MUST be set to a STABLE, 21-character value
     * per deployment — the agent's keystore and AID are deterministically derived from it, so a
     * blank (or rotating) bran creates a brand-new agent identity on every restart, which breaks
     * every existing Veridian wallet pairing (inbound IPEX notifications stop arriving for the old
     * AID). Left blank, {@link KeriConfig#resolveBran} falls back to an EPHEMERAL random passcode
     * and logs a loud CONFIG/SECURITY warning — that fallback exists so the app still starts, not
     * as an acceptable production default.
     */
    private String bran;

    /**
     * The alias under which the indexer's own KERI agent AID is created/looked up
     * ({@code identifiers().get}/{@code create}). Stable across restarts by design: changing it
     * makes {@link KeriConfig} create (or look up) a DIFFERENT agent AID under the same {@link
     * #bran}, which is just as pairing-breaking as an unstable bran.
     */
    private String identifierName = "reeve-indexer-agent";

    /**
     * @deprecated Use {@link #credentialSchemas}' {@code oobis} instead. Kept for one release
     * for backward compatibility: still honored (unioned with every configured schema's
     * {@code oobis}) when resolving OOBIs at startup in {@link KeriConfig}.
     */
    @Deprecated
    private List<String> oobis;

    /** Per-schema KERI credential trust registry entries. See {@link CredentialSchema}. */
    private List<CredentialSchema> credentialSchemas = new ArrayList<>();

    /**
     * Poll interval for {@code KeriNotificationCorrelator}'s synchronous wait loop against the
     * agent's notification queue (card-attestation ceremony, design doc Part A / A3). Default ported
     * from the platform's {@code keri_attestation} module's {@code notification-poll-interval}.
     */
    private Duration notificationPollInterval = Duration.ofMillis(1500);

    /**
     * Bounded, in-thread wait for the wallet's IPEX offer/grant reply during credential presentation
     * ({@code CardCredentialService#presentCredential}, design doc Part A / A4). Mirrors the
     * platform's {@code keri_attestation} module's {@code remotesignTimeout}, reused here for the
     * same purpose (the ceremony runs synchronously in the indexer's request thread, so this bounds
     * how long a single HTTP call blocks before failing the step and letting a retry resume it).
     */
    private Duration walletResponseTimeout = Duration.ofMinutes(3);

    /**
     * The credential SCHEMA SERVER's base OOBI URL (e.g. {@code
     * https://cred-issuance.demo.idw-sandboxes.cf-deployments.org/oobi}, no trailing slash) — the
     * IPEX apply's top-level {@code oobiUrl} field (with a trailing slash appended), which is where
     * a Veridian-style wallet actually resolves the credential schema behind the apply's {@code s}
     * SAID from ({@code CardCredentialService}, design doc Part A / A4). Mirrors the platform's
     * {@code keri_attestation} module's {@code credential-policy.schema-base-url} — a proven-working
     * wallet-contract requirement, not our own agent's OOBI. Distinct from {@link
     * CredentialSchema#oobis()}: those are resolved by OUR OWN agent to learn the issuer/registry/
     * root KEL and TEL data a schema's credentials need to verify; this is handed to the WALLET so
     * it knows where to resolve the schema definition itself.
     */
    private String credentialSchemaOobiBaseUrl = "https://cred-issuance.demo.idw-sandboxes.cf-deployments.org/oobi";
}
