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
            WHERE (:organisationId IS NULL OR r.organisationId = :organisationId)
            AND (:subType IS NULL OR r.subType = :subType)
            AND (:interval IS NULL OR r.interval = :interval)
            AND (:year IS NULL OR r.year = :year)
            AND (:period IS NULL OR r.period = :period)
            """)
    List<ReportEntity> findAllByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriod(
            @Param("organisationId") String organisationId, @Param("subType") String subType,
            @Param("interval") Interval interval, @Param("year") Short year,
            @Param("period") Short period, Pageable pageable);


    @Query("""
            SELECT r FROM ReportEntity r
            WHERE r.organisationId = :organisationId
            AND r.subType = :reportType
            AND r.year >= :startYear AND r.year <= :endYear
            """)
    Set<ReportEntity> findByTypeAndWithinYearRange(@Param("organisationId") String organisationId, @Param("reportType") String reportType, @Param("startYear") int startYear, @Param("endYear") int endYear);

    Optional<ReportEntity> findByTxHash(String txHash);
}
