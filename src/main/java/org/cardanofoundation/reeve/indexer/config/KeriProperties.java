package org.cardanofoundation.reeve.indexer.config;

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
}
