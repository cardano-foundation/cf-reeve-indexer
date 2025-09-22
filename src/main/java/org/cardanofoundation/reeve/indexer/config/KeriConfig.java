package org.cardanofoundation.reeve.indexer.config;

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
        for (String oobi : keriProperties.getOobisList()) {
            Object object = client.oobis().resolve(oobi, null);
            client.operations().wait(Operation.fromObject(object));
        }
        return client;
    }

}
