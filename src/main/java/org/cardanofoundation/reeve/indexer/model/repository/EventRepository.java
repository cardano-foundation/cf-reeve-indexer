package org.cardanofoundation.reeve.indexer.model.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.cardanofoundation.reeve.indexer.model.entity.EventEntity;
import org.cardanofoundation.reeve.indexer.model.view.EventProjectView;

public interface EventRepository extends JpaRepository<EventEntity, Long> {

    @Query(value = "SELECT DISTINCT e FROM EventEntity e " +
            "LEFT JOIN e.allocations a " +
            "WHERE (:organisationId IS NULL OR e.organisationId = :organisationId) " +
            "AND (:eventTypes IS NULL OR e.eventType IN :eventTypes) " +
            "AND (:categories IS NULL OR e.eventCategory IN :categories) " +
            "AND (:projectIds IS NULL OR a.projectId IN :projectIds) " +
            "AND (:fundingIds IS NULL OR e.fundingId IN :fundingIds) " +
            "AND (:blockChainHash IS NULL OR e.txHash = :blockChainHash) " +
            "AND (cast(:startDate as date) IS NULL OR e.date >= :startDate) " +
            "AND (cast(:endDate as date) IS NULL OR e.date <= :endDate) " +
            "AND (:minAmount IS NULL OR e.totalAmount >= :minAmount) " +
            "AND (:maxAmount IS NULL OR e.totalAmount <= :maxAmount)",
            countQuery = "SELECT COUNT(DISTINCT e) FROM EventEntity e " +
                    "LEFT JOIN e.allocations a " +
                    "WHERE (:organisationId IS NULL OR e.organisationId = :organisationId) " +
                    "AND (:eventTypes IS NULL OR e.eventType IN :eventTypes) " +
                    "AND (:categories IS NULL OR e.eventCategory IN :categories) " +
                    "AND (:projectIds IS NULL OR a.projectId IN :projectIds) " +
                    "AND (:fundingIds IS NULL OR e.fundingId IN :fundingIds) " +
                    "AND (:blockChainHash IS NULL OR e.txHash = :blockChainHash) " +
                    "AND (cast(:startDate as date) IS NULL OR e.date >= :startDate) " +
                    "AND (cast(:endDate as date) IS NULL OR e.date <= :endDate) " +
                    "AND (:minAmount IS NULL OR e.totalAmount >= :minAmount) " +
                    "AND (:maxAmount IS NULL OR e.totalAmount <= :maxAmount)")
    Page<EventEntity> search(
            @Param("organisationId") String organisationId,
            @Param("eventTypes") Set<String> eventTypes,
            @Param("categories") Set<String> categories,
            @Param("projectIds") Set<String> projectIds,
            @Param("fundingIds") Set<String> fundingIds,
            @Param("blockChainHash") String blockChainHash,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            Pageable pageable);

    List<EventEntity> findByTxHashOrderByEventId(String txHash);

    @Query("SELECT DISTINCT e.eventType FROM EventEntity e WHERE e.organisationId = :orgId ORDER BY e.eventType")
    List<String> findDistinctEventTypesByOrganisationId(@Param("orgId") String orgId);

    @Query("SELECT DISTINCT NEW org.cardanofoundation.reeve.indexer.model.view.EventProjectView(a.projectId, a.projectTitle) " +
            "FROM EventEntity e JOIN e.allocations a " +
            "WHERE e.organisationId = :orgId AND a.projectId IS NOT NULL")
    List<EventProjectView> findDistinctProjectsByOrganisationId(@Param("orgId") String orgId);
}
