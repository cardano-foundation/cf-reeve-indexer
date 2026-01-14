package org.cardanofoundation.reeve.indexer.yaci;

import java.security.DigestException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import co.nstant.in.cbor.CborException;
import co.nstant.in.cbor.model.DataItem;
import co.nstant.in.cbor.model.Map;
import co.nstant.in.cbor.model.UnsignedInteger;
import com.bloxbean.cardano.client.common.cbor.CborSerializationUtil;
import com.bloxbean.cardano.client.util.HexUtil;
import com.bloxbean.cardano.yaci.store.metadata.domain.TxMetadataLabel;
import com.bloxbean.cardano.yaci.store.metadata.storage.impl.TxMetadataStorageImpl;
import com.bloxbean.cardano.yaci.store.metadata.storage.impl.mapper.MetadataMapper;
import com.bloxbean.cardano.yaci.store.metadata.storage.impl.repository.TxMetadataLabelRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.ReportType;
import org.cardanofoundation.reeve.indexer.model.domain.Transaction;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.IdentityMetadata;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.IdentityType;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity;
import org.cardanofoundation.reeve.indexer.model.entity.IdentityEventEntity;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;
import org.cardanofoundation.reeve.indexer.model.entity.TransactionEntity;
import org.cardanofoundation.reeve.indexer.model.entity.mapper.CredentialMetadataMapper;
import org.cardanofoundation.reeve.indexer.model.repository.CredentialRepository;
import org.cardanofoundation.reeve.indexer.model.repository.CurrencyRepository;
import org.cardanofoundation.reeve.indexer.model.repository.IdentityEventRepository;
import org.cardanofoundation.reeve.indexer.model.repository.OrganisationRepository;
import org.cardanofoundation.reeve.indexer.model.repository.ReportRepository;
import org.cardanofoundation.reeve.indexer.model.repository.TransactionRepository;
import org.cardanofoundation.reeve.indexer.service.KeriService;
import org.cardanofoundation.signify.cesr.Diger;
import org.cardanofoundation.signify.cesr.args.RawArgs;
import org.cardanofoundation.signify.cesr.util.CoreUtil;

@Component
@Slf4j
public class ReeveMetadataStorage extends TxMetadataStorageImpl {

    @Value("${reeve.label}")
    private String reeveMetadataLabel;
    @Value("${keri.metadata-label:170}")
    private String keriMetadataLabel;
    @Value("${keri.enabled:false}")
    private boolean keriEnabled;
    private final ObjectMapper objectMapper;
    private final TransactionRepository transactionRepository;
    private final ReportRepository reportRepository;
    private final OrganisationRepository organisationRepository;
    private final CurrencyRepository currencyRepository;
    private final KeriService keriService;
    private final IdentityEventRepository identityRepository;
    private final CredentialRepository credentialRepository;

    public ReeveMetadataStorage(ObjectMapper objectMapper,
            TransactionRepository transactionRepository, ReportRepository reportRepository,
            TxMetadataLabelRepository metadataLabelRepository, MetadataMapper metadataMapper,
            OrganisationRepository organisationRepository, CurrencyRepository currencyRepository,
            KeriService keriService, IdentityEventRepository identityRepository, CredentialRepository credentialRepository) {
        super(metadataLabelRepository, metadataMapper);
        this.objectMapper = objectMapper;
        this.transactionRepository = transactionRepository;
        this.reportRepository = reportRepository;
        this.organisationRepository = organisationRepository;
        this.currencyRepository = currencyRepository;
        this.keriService = keriService;
        this.identityRepository = identityRepository;
        this.credentialRepository = credentialRepository;
    }

    @Override
    @Transactional
    public List<TxMetadataLabel> saveAll(List<TxMetadataLabel> txMetadataLabelsList) {
        List<ReeveMetadata> reeveTxs = txMetadataLabelsList.stream()
                .filter(metadata -> metadata.getLabel().equals(reeveMetadataLabel))
                .map(metadata -> {
                    try {
                        ReeveMetadata rawMetadata =
                                objectMapper.readValue(metadata.getBody(), ReeveMetadata.class);
                        rawMetadata.setTxHash(metadata.getTxHash());
                        Map metadataCborMap = (Map) CborSerializationUtil
                                .deserialize(HexUtil.decodeHexString(metadata.getCbor()));
                        DataItem dataItem = metadataCborMap
                                .get(new UnsignedInteger(Long.valueOf(reeveMetadataLabel)));

                        byte[] blake3_256 =
                                CoreUtil.blake3_256(CborSerializationUtil.serialize(dataItem), 32);
                        Diger diger = new Diger(RawArgs.builder().raw(blake3_256).build());
                        rawMetadata.setMetadataHash(diger.getQb64());
                        return rawMetadata;
                    } catch (JsonProcessingException e) {
                        log.error("Can't parse metadata of transaction: {}, error: {}",
                                metadata.getTxHash(), e.getMessage());
                        return null;
                    } catch (DigestException e) {
                        log.error("Can't calculate metadata hash of transaction: {}, error: {}",
                                metadata.getTxHash(), e.getMessage());
                        return null;
                    } catch (CborException e) {
                        log.error("Can't parse cbor of transaction: {}, error: {}",
                                metadata.getTxHash(), e.getMessage());
                        return null;
                    }
                }).filter(Objects::nonNull).toList();
        handleReeveTxs(reeveTxs);
        if (keriEnabled) {
            List<IdentityMetadata> list = txMetadataLabelsList.stream()
                    .filter(metadata -> metadata.getLabel().equals(keriMetadataLabel))
                    .map(metadata -> {
                        try {
                            IdentityMetadata rawMetadata = objectMapper
                                    .readValue(metadata.getBody(), IdentityMetadata.class);
                            rawMetadata.setTxHash(metadata.getTxHash());
                            return rawMetadata;
                        } catch (JsonProcessingException e) {
                            log.error("Can't parse metadata of transaction: {}, error: {}",
                                    metadata.getTxHash(), e.getMessage());
                            return null;
                        }
                    }).filter(Objects::nonNull).toList();
            handleIdentityTxs(list);
        }



        return List.of(); // Prevent yaci from storing unrelated metadata
    }

    private void handleIdentityTxs(List<IdentityMetadata> list) {
        list.forEach(rawMetadata -> {
            if(rawMetadata.getT() == IdentityType.ATTEST) {
                IdentityEventEntity identityEntity = IdentityEventEntity.builder()
                    .txHash(rawMetadata.getTxHash())
                    .sequenceNumber(rawMetadata.getS())
                    .dataHash(rawMetadata.getD())
                    .identifier(rawMetadata.getI())
                    .type(rawMetadata.getT().name())
                .build();
                identityRepository.saveAndFlush(identityEntity);
                keriService.verifyIdentityTx(identityEntity);

            } else if (rawMetadata.getT() == IdentityType.AUTH_BEGIN) {
                CredentialEntity entity = CredentialMetadataMapper.toEntity(rawMetadata);
                try {
                    keriService.verifyCredentialEntity(entity);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
                credentialRepository.saveAndFlush(entity);
            } else if(rawMetadata.getT() == IdentityType.AUTH_END) {
                // TODO handle AUTH_END if needed
            }
        });
    }

    private void handleReeveTxs(List<ReeveMetadata> reeveTxs) {
        reeveTxs.forEach(rawMetadata -> {
            // Store organisation if not exists, handle race condition in parallel events
            organisationRepository.saveIfNotExists(
                    rawMetadata.getOrg().getId(),
                    rawMetadata.getOrg().getName(), rawMetadata.getOrg().getCurrencyId(),
                    rawMetadata.getOrg().getCountryCode(), rawMetadata.getOrg().getTaxIdNumber(),
                    rawMetadata.getTxHash()
            );
            // verifiy identity
            boolean identityVerified = false; // TODO need to implement identity verification
            if (rawMetadata.getType() == ReeveTransactionType.INDIVIDUAL_TRANSACTIONS) {
                List<TransactionEntity> transactionEntities =
                        ((List<Transaction>) rawMetadata.getData()).stream().map(transaction -> {
                            TransactionEntity entity = transaction.toEntity();
                            // storing currencies if not exists
                            transaction.getItems().forEach(item -> {
                                Optional.ofNullable(item.getDocument()).ifPresent(doc -> {
                                    if (doc.getCurrency() != null) {
                                        currencyRepository.saveIfNotExists(
                                                rawMetadata.getOrg().getId(),
                                                doc.getCurrency().getId(),
                                                doc.getCurrency().getCustCode());
                                    }
                                });
                            });

                            entity.setOrganisationId(rawMetadata.getOrg().getId());
                            entity.setTxHash(rawMetadata.getTxHash());
                            return entity;
                        }).toList();
                transactionRepository.saveAll(transactionEntities);
            }
            if (rawMetadata.getType() == ReeveTransactionType.REPORT) {
                ReportEntity reportEntity = ReportEntity.builder()
                        .organisationId(rawMetadata.getOrg().getId())
                        .type(ReportType.V1)
                        .txHash(rawMetadata.getTxHash())
                        .interval(rawMetadata.getInterval())
                        .year(rawMetadata.getYear())
                        .period(rawMetadata.getPeriod())
                        .subType(rawMetadata.getSubType()).ver(rawMetadata.getVer())
                        .fields((String) rawMetadata.getData()).identityVerified(identityVerified)
                        .metadataHash(rawMetadata.getMetadataHash()).build();
                reportRepository.saveAndFlush(reportEntity);
            }
            if (rawMetadata.getType() == ReeveTransactionType.REPORT_V2) {
                ReportEntity reportEntity = ReportEntity.builder()
                        .organisationId(rawMetadata.getOrg().getId())
                        .type(ReportType.V2)
                        .txHash(rawMetadata.getTxHash()).interval(rawMetadata.getInterval())
                        .year(rawMetadata.getYear()).period(rawMetadata.getPeriod())
                        .subType(rawMetadata.getSubType()).ver(rawMetadata.getVer())
                        // .fields((String) rawMetadata.getData()).identityVerified(identityVerified) // Fields stored in contract data
                        .metadataHash(rawMetadata.getMetadataHash()).build();
                reportRepository.saveAndFlush(reportEntity);
            }
        });
    }

}
