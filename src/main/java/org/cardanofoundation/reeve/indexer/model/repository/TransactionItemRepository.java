package org.cardanofoundation.reeve.indexer.model.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionItemEntity;

public interface TransactionItemRepository extends JpaRepository<TransactionItemEntity, String> {

    List<TransactionItemEntity> findByTransactionId(String transactionId);

    @Query("""
            SELECT i FROM TransactionItemEntity i
            WHERE (:organisationId IS NULL OR i.transaction.organisationId = :organisationId)
            AND (:transactionInternalNumber IS NULL OR LOWER(i.transaction.internalNumber) LIKE LOWER(CONCAT('%', CAST(:transactionInternalNumber AS string), '%')))
            AND i.transaction.date >= COALESCE(:dateFrom, i.transaction.date)
            AND i.transaction.date <= COALESCE(:dateTo, i.transaction.date)
            AND (:events IS NULL OR i.eventCode IN :events)
            AND (:currencies IS NULL OR i.currency IN :currencies)
            AND (:minAmountLcy IS NULL OR i.amountLcy >= :minAmountLcy)
            AND (:maxAmountLcy IS NULL OR i.amountLcy <= :maxAmountLcy)
            AND (:minAmountFcy IS NULL OR i.amountFcy >= :minAmountFcy)
            AND (:maxAmountFcy IS NULL OR i.amountFcy <= :maxAmountFcy)
            AND (:transactionHashes IS NULL OR i.transaction.txHash IN :transactionHashes)
            AND (:documentNumber IS NULL OR i.documentNumber IN :documentNumber)
            AND (:type IS NULL OR i.transaction.type IN :type)
            AND (:vatCustCode IS NULL OR i.vatCustCode IN :vatCustCode)
            AND (:costCenterCustCode IS NULL OR i.costCenterCustCode IN :costCenterCustCode)
            AND (:projectCustCode IS NULL OR i.projectCustCode IN :projectCustCode)
            AND (:counterPartyType IS NULL OR i.counterPartyType IN :counterPartyType)
            AND (:counterPartyCustCode IS NULL OR i.counterPartyCustCode IN :counterPartyCustCode)
            """)
    Page<TransactionItemEntity> searchItems(
            @Param("organisationId") String organisationId,
            @Param("transactionInternalNumber") String transactionInternalNumber,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            @Param("events") Set<String> events,
            @Param("currencies") Set<String> currencies,
            @Param("minAmountLcy") Double minAmountLcy,
            @Param("maxAmountLcy") Double maxAmountLcy,
            @Param("minAmountFcy") Double minAmountFcy,
            @Param("maxAmountFcy") Double maxAmountFcy,
            @Param("transactionHashes") Set<String> transactionHashes,
            @Param("documentNumber") Set<String> documentNumber,
            @Param("type") Set<String> type,
            @Param("vatCustCode") Set<String> vatCustCode,
            @Param("costCenterCustCode") Set<String> costCenterCustCode,
            @Param("projectCustCode") Set<String> projectCustCode,
            @Param("counterPartyType") Set<String> counterPartyType,
            @Param("counterPartyCustCode") Set<String> counterPartyCustCode,
            Pageable pageable
    );

}
