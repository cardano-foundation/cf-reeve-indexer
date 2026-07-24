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
     * @deprecated Use {@link #credentialSchemas}' {@code oobis} instead. Kept for one release
     * for backward compatibility: still honored (unioned with every configured schema's
     * {@code oobis}) when resolving OOBIs at startup in {@link KeriConfig}.
     */
    @Deprecated
    private List<String> oobis;

    /** Per-schema KERI credential trust registry entries. See {@link CredentialSchema}. */
    private List<CredentialSchema> credentialSchemas = new ArrayList<>();
}
