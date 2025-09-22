package org.cardanofoundation.reeve.indexer.service;

import java.math.BigInteger;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bloxbean.cardano.client.crypto.bip39.Sha256Hash;
import com.bloxbean.cardano.client.util.HexUtil;

import org.cardanofoundation.reeve.indexer.config.KeriProperties;
import org.cardanofoundation.reeve.indexer.model.domain.Identity;
import org.cardanofoundation.signify.app.clienting.SignifyClient;
import org.cardanofoundation.signify.app.coring.Operation;

@RequiredArgsConstructor
@Service
@Slf4j
public class KeriService {

    private final Optional<SignifyClient> client;
    private final KeriProperties keriProperties;
    @Value("${keri.enabled:false}")
    private boolean keriEnabled;

    public boolean verifyIdentity(Identity identity) throws Exception {
        if(!keriEnabled) {
            log.warn("KERI is not enabled. Skipping identity verification for: {}", identity.getAid());
            return false;
        }
        // resolveOobis();
        log.info("Verifying identity: {}", identity.getAid());
        List<Object> keyEventLog = (List<Object>) client.orElseThrow().keyEvents().get(identity.getAid());
        if(keyEventLog == null || keyEventLog.isEmpty()) {
            log.warn("No key event log found for identity: {}", identity.getAid());
            return false;
        }
        BigInteger sequenceNumber = BigInteger.valueOf(Long.parseLong(identity.getSn()));
        if(keyEventLog.size() <= sequenceNumber.intValue()) {
            log.warn("Key event log size {} is less than or equal to sequence number {} for identity: {}", keyEventLog.size(), sequenceNumber, identity.getAid());
            return false;
        }

        Map<String, Object> interactionEvent =
        (Map<String, Object>) keyEventLog.get(sequenceNumber.intValue());
        Map<String, Object> verifiedKed = (Map<String, Object>) interactionEvent.get("ked");
        List<String> messages = (List<String>) verifiedKed.get("a");
        if(messages == null || messages.isEmpty()) {
            log.warn("No messages found in interaction event for identity: {}", identity.getAid());
            return false;
        }
        String data = messages.getFirst();
        if (!HexUtil.encodeHexString(Sha256Hash.hash(data.getBytes())).equals(identity.getDataHash())) {
            log.warn("Data hash does not match for identity: {}", identity.getAid());
            return false;
        }

        log.info("Identity verified: {}", identity.getAid());
        return true;
    }

    private void resolveOobis() {
        for (String oobi : keriProperties.getOobisList()) {
            try {
                Object object = client.orElseThrow().oobis().resolve(oobi, null);
                client.orElseThrow().operations().wait(Operation.fromObject(object));
            } catch (Exception e) {
                log.error("Error resolving OOBI: {}", oobi, e);
            }
        }
    }
}
