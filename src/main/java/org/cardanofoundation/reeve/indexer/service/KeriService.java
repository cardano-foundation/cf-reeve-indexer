package org.cardanofoundation.reeve.indexer.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.cardanofoundation.signify.app.credentialing.registries.RegistryVerifyOptions;
import org.cardanofoundation.signify.cesr.Serder;
import org.cardanofoundation.signify.cesr.util.CESRStreamUtil;
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

    public void verifyCredentialEntity(CredentialEntity entity) throws Exception {
        String credentialChain = entity.getCredentialChain();
        ObjectMapper objectMapper = new ObjectMapper();
        List<String> chain = objectMapper.readValue(credentialChain, new TypeReference<List<String>>() {});
        List<String> list = chain.stream().map(s -> parseHexString(s)).toList();
        String fullAttachementString = String.join("", list);
        List<Map<String, Object>> leCesrData = CESRStreamUtil.parseCESRData(fullAttachementString);
        if(leCesrData.isEmpty()) {
            log.warn("Credential chain is empty for prefixId: {}", entity.getPrefixId());
            entity.setValid(false);
            credentialRepository.save(entity);
            return;
        }

        List<Map<String, Object>> allVcpEvents = new ArrayList<>();
        List<String> allVcpAttachments = new ArrayList<>();

        for (Map<String, Object> eventData : leCesrData) {
            Map<String, Object> event = (Map<String, Object>) eventData.get("event");
            Object eventTypeObj = event.get("t");
            if (eventTypeObj != null && "vcp".equals(eventTypeObj.toString())) {
                allVcpEvents.add(event);
                allVcpAttachments.add((String) eventData.get("atc"));
            }
        }

        for (int i = 0; i < allVcpEvents.size(); i++) {
            Map<String, Object> vcpEvent = allVcpEvents.get(i);
            String vcpAttachment = allVcpAttachments.get(i);
            Serder vcpSerder = new Serder(vcpEvent);

            RegistryVerifyOptions registryVerifyOptions = RegistryVerifyOptions.builder()
                    .vcp(vcpSerder)
                    .atc(vcpAttachment)
                    .build();

            Object registryVerifyOp = client.orElseThrow().registries().verify(registryVerifyOptions);

            Operation<?> registryOperation = client.orElseThrow().operations().wait(Operation.fromObject(registryVerifyOp));
            System.out.println("✓ VCP #" + (i + 1) + " verification completed successfully");
        }

        entity.setValid(true);
    }

    public String parseHexString(String hexString) {
        // Remove "0x" prefix if present
        String hex = hexString.startsWith("0x") ? hexString.substring(2) : hexString;

        // Convert hex to bytes
        byte[] bytes = new byte[hex.length() / 2];
        for (int i = 0; i < bytes.length; i++) {
            bytes[i] = (byte) Integer.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }

        // Convert bytes to String
        return new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
    }
}
