package org.cardanofoundation.reeve.indexer.config;

import java.util.LinkedHashSet;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.cardanofoundation.signify.app.clienting.SignifyClient;
import org.cardanofoundation.signify.app.coring.Coring;
import org.cardanofoundation.signify.app.coring.Operation;
import org.cardanofoundation.signify.cesr.Salter;

@Configuration
@ConditionalOnProperty(name = "keri.enabled", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
@Slf4j
public class KeriConfig {

    private final KeriProperties keriProperties;

    @Bean
    @ConditionalOnProperty(name = "keri.enabled", havingValue = "true", matchIfMissing = false)
    public SignifyClient signifyClient() throws Exception {
        log.info("Creating SignifyClient with URL: {}, Boot URL: {}", keriProperties.getUrl(), keriProperties.getBootUrl());
        String bran = Coring.randomPasscode();
        SignifyClient client = new SignifyClient(keriProperties.getUrl(), bran, Salter.Tier.low, keriProperties.getBootUrl(), null);
        try {
            client.connect();
        } catch (Exception e) {
            client.boot();
            client.connect();
        }
        log.info("SignifyClient connected");
        for (String oobi : resolvableOobis()) {
            Object object = client.oobis().resolve(oobi, null);
            client.operations().wait(Operation.fromObject(object));
        }
        return client;
    }

    /**
     * Union of every configured credential schema's OOBIs plus the legacy (deprecated)
     * {@code keri.oobis} list, de-duplicated and order-preserving.
     */
    private Set<String> resolvableOobis() {
        Set<String> oobis = new LinkedHashSet<>();
        if (keriProperties.getCredentialSchemas() != null) {
            keriProperties.getCredentialSchemas().forEach(schema -> {
                if (schema != null && schema.oobis() != null) {
                    oobis.addAll(schema.oobis());
                }
            });
        }
        if (keriProperties.getOobis() != null) {
            oobis.addAll(keriProperties.getOobis());
        }
        return oobis;
    }

}
