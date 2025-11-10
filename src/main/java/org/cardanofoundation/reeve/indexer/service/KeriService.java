package org.cardanofoundation.reeve.indexer.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.cardanofoundation.reeve.indexer.config.KeriProperties;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity;
import org.cardanofoundation.reeve.indexer.model.entity.IdentityEventEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CredentialRepository;
import org.cardanofoundation.reeve.indexer.model.repository.ReportRepository;
import org.cardanofoundation.signify.app.clienting.SignifyClient;
import org.cardanofoundation.signify.app.coring.Operation;
import org.cardanofoundation.signify.cesr.exceptions.LibsodiumException;

@RequiredArgsConstructor
@Service
@Slf4j
public class KeriService {

    private final Optional<SignifyClient> client;
    private final KeriProperties keriProperties;
    @Value("${keri.enabled:false}")
    private boolean keriEnabled;
    private final ReportRepository reportRepository;
    private final CredentialRepository credentialRepository;

    private void resolveOobis() {
        for (String oobi : keriProperties.getOobis()) {
            client.ifPresent(c ->
            {
                try {
                    Object object = c.oobis().resolve(oobi, null);
                    c.operations().wait(Operation.fromObject(object));
                } catch (LibsodiumException | IOException | InterruptedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            });

        }
    }

    @SuppressWarnings("unchecked")
    public boolean verifyEvent(IdentityEventEntity identity) throws Exception {
        if(!keriEnabled) {
            log.warn("KERI is not enabled. Skipping identity verification for: {}", identity.getIdentifier());
            return false;
        }
        resolveOobis();
        // TODO will fix this when we are finalizing the identity demo
        List<Object> keyEvents = (List<Object>)client.orElseThrow().keyEvents().get(identity.getIdentifier());
        int index;
        try {
            index = Integer.parseUnsignedInt(identity.getSequenceNumber(), 16);
        } catch (NumberFormatException e) {
            log.error("Invalid hex sequence number: {}", identity.getSequenceNumber(), e);
            throw e;
        }
        if(keyEvents.size() <= index) {
            log.error("KERI key events do not contain index {} for identifier {}", index, identity.getIdentifier());
            return false;
        }
        Map<String, Object> kelEvent = (Map<String, Object>) keyEvents.get(index);
        Map<String, Object> kedEvent = (Map<String, Object>) kelEvent.get("ked");
        List<String> aList = (List<String>) kedEvent.get("a");
        return aList.getFirst().equals(identity.getDataHash());
    }

    public void verifyIdentityTx(IdentityEventEntity identityEntity) {
        if(!keriEnabled) {
            log.warn("KERI is not enabled. Skipping identity verification for txHash: {}", identityEntity.getTxHash());
            return;
        }
        reportRepository.findByTxHash(identityEntity.getTxHash()).ifPresent(report -> {
            try {
                log.info("MetadataHash {} identiyEntityEventHash {}", report.getMetadataHash(), identityEntity.getDataHash());
                if(report.getMetadataHash().equals(identityEntity.getDataHash())) {
                    boolean verifyEvent = verifyEvent(identityEntity);
                    Optional<CredentialEntity> credential = credentialRepository.findById(identityEntity.getIdentifier());
                    if(verifyEvent && credential.isPresent() && Boolean.TRUE.equals(credential.get().getValid())) {
                        report.setIdentifier(identityEntity.getIdentifier());
                        report.setIdentityVerified(true);
                    }
                    reportRepository.save(report);
                }
            } catch (Exception e) {
                log.error("Error verifying identity for txHash: {}", identityEntity.getTxHash(), e);
            }
        });
    }
}
