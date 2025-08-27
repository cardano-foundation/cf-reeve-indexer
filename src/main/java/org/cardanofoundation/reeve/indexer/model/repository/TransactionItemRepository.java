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
            AND i.transaction.date >= COALESCE(:dateFrom, i.transaction.date)
            AND i.transaction.date <= COALESCE(:dateTo, i.transaction.date)
            AND (:events IS NULL OR i.eventCode IN :events)
            AND (:currencies IS NULL OR i.currency IN :currencies)
            AND (:minAmount IS NULL OR i.amount >= :minAmount)
            AND (:maxAmount IS NULL OR i.amount <= :maxAmount)
            AND (:transactionHashes IS NULL OR i.transaction.txHash IN :transactionHashes)
            """)
    Page<TransactionItemEntity> searchItems(@Param("organisationId") String organisationId, @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo, @Param("events") Set<String> events, @Param("currencies") Set<String> currencies, @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount, @Param("transactionHashes") Set<String> transactionHashes, Pageable pageable);

}
