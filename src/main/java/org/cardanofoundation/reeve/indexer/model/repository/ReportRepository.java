package org.cardanofoundation.reeve.indexer.model.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.cardanofoundation.reeve.indexer.model.domain.Interval;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;

public interface ReportRepository extends JpaRepository<ReportEntity, Long> {

    @Query("""
            SELECT r FROM ReportEntity r
            INNER JOIN OrganisationEntity o ON r.organisationId = o.id
            WHERE (:organisationId IS NULL OR r.organisationId = :organisationId)
            AND (:subTypes IS NULL OR r.subType IN :subTypes)
            AND (:intervals IS NULL OR r.interval IN :intervals)
            AND (:years IS NULL OR r.year IN :years)
            AND (:periods IS NULL OR r.period IN :periods)
            AND (:blockChainHash IS NULL OR r.txHash = :blockChainHash)
            AND (:currency IS NULL OR o.currencyId = :currency)
            """)
    List<ReportEntity> findAllByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriod(
            @Param("organisationId") String organisationId,
            @Param("blockChainHash") String blockChainHash,
            @Param("currency") String currency,
            @Param("subTypes") List<String> subTypes,
            @Param("intervals") List<Interval> intervals,
            @Param("years") List<Integer> years,
            @Param("periods") List<Integer> periods,
            Pageable pageable);


    @Query("""
            SELECT r FROM ReportEntity r
            WHERE r.organisationId = :organisationId
            AND r.subType = :reportType
            AND r.year >= :startYear AND r.year <= :endYear
            """)
    Set<ReportEntity> findByTypeAndWithinYearRange(@Param("organisationId") String organisationId, @Param("reportType") String reportType, @Param("startYear") int startYear, @Param("endYear") int endYear);

    Optional<ReportEntity> findByTxHash(String txHash);
}
