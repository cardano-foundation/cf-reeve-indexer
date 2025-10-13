package org.cardanofoundation.reeve.indexer.service;

import java.util.LinkedHashMap;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.cardanofoundation.reeve.indexer.config.KeriProperties;
import org.cardanofoundation.reeve.indexer.model.entity.IdentityEventEntity;
import org.cardanofoundation.reeve.indexer.model.repository.ReportRepository;
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
    private final ReportRepository reportRepository;

    public boolean verifyIdentity(IdentityEventEntity identity) throws Exception {
        if(!keriEnabled) {
            log.warn("KERI is not enabled. Skipping identity verification for: {}", identity.getIdentifier());
            return false;
        }
        Object o = client.orElseThrow().keyStates().query(identity.getIdentifier(), identity.getSequenceNumber());
        Operation<Object> wait = client.orElseThrow().operations().wait(Operation.fromObject(o));
        LinkedHashMap<String, Object> response = (LinkedHashMap<String, Object>) wait.getResponse();
        return ((String)response.get("d")).equals(identity.getEventHash());
    }

    public void verifyIdentityTx(IdentityEventEntity identityEntity) {
        if(!keriEnabled) {
            log.warn("KERI is not enabled. Skipping identity verification for txHash: {}", identityEntity.getTxHash());
            return;
        }
        reportRepository.findByTxHash(identityEntity.getTxHash()).ifPresent(report -> {
            try {
                if(report.getMetadataHash().equals(identityEntity.getDataHash())) {
                    report.setIdentityVerified(verifyIdentity(identityEntity));
                    reportRepository.save(report);
                }
            } catch (Exception e) {
                log.error("Error verifying identity for txHash: {}", identityEntity.getTxHash(), e);
            }
        });
    }
}
