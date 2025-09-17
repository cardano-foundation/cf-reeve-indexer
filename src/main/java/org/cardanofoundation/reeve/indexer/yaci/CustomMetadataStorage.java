package org.cardanofoundation.reeve.indexer.yaci;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bloxbean.cardano.yaci.store.metadata.domain.TxMetadataLabel;
import com.bloxbean.cardano.yaci.store.metadata.storage.impl.TxMetadataStorageImpl;
import com.bloxbean.cardano.yaci.store.metadata.storage.impl.mapper.MetadataMapper;
import com.bloxbean.cardano.yaci.store.metadata.storage.impl.repository.TxMetadataLabelRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.domain.RawMetadata;
import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.Transaction;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;
import org.cardanofoundation.reeve.indexer.model.entity.TransactionEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CurrencyRepository;
import org.cardanofoundation.reeve.indexer.model.repository.OrganisationRepository;
import org.cardanofoundation.reeve.indexer.model.repository.ReportRepository;
import org.cardanofoundation.reeve.indexer.model.repository.TransactionRepository;

@Component
@Slf4j
public class CustomMetadataStorage extends TxMetadataStorageImpl {

    @Value("${reeve.label}")
    private String metadataLabel;
    private final ObjectMapper objectMapper;
    private final TransactionRepository transactionRepository;
    private final ReportRepository reportRepository;
    private final OrganisationRepository organisationRepository;
    private final CurrencyRepository currencyRepository;

    public CustomMetadataStorage(ObjectMapper objectMapper,
            TransactionRepository transactionRepository, ReportRepository reportRepository,
            TxMetadataLabelRepository metadataLabelRepository, MetadataMapper metadataMapper,
            OrganisationRepository organisationRepository, CurrencyRepository currencyRepository) {
        super(metadataLabelRepository, metadataMapper);
        this.objectMapper = objectMapper;
        this.transactionRepository = transactionRepository;
        this.reportRepository = reportRepository;
        this.organisationRepository = organisationRepository;
        this.currencyRepository = currencyRepository;
    }

    @Override
    @Transactional
    public List<TxMetadataLabel> saveAll(List<TxMetadataLabel> txMetadataLabelsList) {
        List<RawMetadata> list = txMetadataLabelsList.stream()
                .filter(metadata -> metadata.getLabel().equals(metadataLabel)).map(metadata -> {
                    try {
                        RawMetadata rawMetadata =
                                objectMapper.readValue(metadata.getBody(), RawMetadata.class);
                        rawMetadata.setTxHash(metadata.getTxHash());
                        return rawMetadata;
                    } catch (JsonProcessingException e) {
                        log.error("Can't parse metadata of transaction: {}, error: {}",
                                metadata.getTxHash(), e.getMessage());
                        return null;
                    }
                }).filter(Objects::nonNull).toList();

        if (!list.isEmpty()) {
            list.forEach(rawMetadata -> {
                // Store organisation if not exists, handle race condition in parallel events
                organisationRepository.saveIfNotExists(rawMetadata.getOrg().getId(),
                        rawMetadata.getOrg().getName(),
                        rawMetadata.getOrg().getCurrencyId(),
                        rawMetadata.getOrg().getCountryCode(),
                        rawMetadata.getOrg().getTaxIdNumber());

                if (rawMetadata.getType() == ReeveTransactionType.INDIVIDUAL_TRANSACTIONS) {
                    List<TransactionEntity> transactionEntities =
                            ((List<Transaction>) rawMetadata.getData()).stream()
                                    .map(transaction -> {
                                        TransactionEntity entity = transaction.toEntity();
                                        // storing currencies if not exists
                                        transaction.getItems().forEach(item -> {
                                            Optional.ofNullable(item.getDocument())
                                                    .ifPresent(doc -> {
                                                        if (doc.getCurrency() != null) {
                                                            currencyRepository.saveIfNotExists(
                                                                    rawMetadata.getOrg().getId(),
                                                                    doc.getCurrency().getId(),
                                                                    doc.getCurrency()
                                                                            .getCustCode());
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
                            .txHash(rawMetadata.getTxHash()).interval(rawMetadata.getInterval())
                            .year(rawMetadata.getYear())
                            .period(rawMetadata.getPeriod())
                            .subType(rawMetadata.getSubType())
                            .ver(rawMetadata.getVer())
                            .fields((String) rawMetadata.getData()).build();
                    reportRepository.save(reportEntity);
                }
            });
        }

        return List.of(); // Prevent yaci from storing unrelated metadata
    }

}
