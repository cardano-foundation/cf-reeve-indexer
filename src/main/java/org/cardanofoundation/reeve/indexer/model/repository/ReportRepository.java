package org.cardanofoundation.reeve.indexer.model.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.cardanofoundation.reeve.indexer.model.domain.Interval;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;
import org.cardanofoundation.reeve.indexer.model.view.OrganisationLastUpdatedView;

public interface ReportRepository extends JpaRepository<ReportEntity, Long> {

    @Query(value = """
            SELECT r FROM ReportEntity r
            INNER JOIN OrganisationEntity o ON r.organisationId = o.id
            WHERE (:organisationId IS NULL OR r.organisationId = :organisationId)
            AND (:subTypes IS NULL OR r.subType IN :subTypes)
            AND (:intervals IS NULL OR r.interval IN :intervals)
            AND (:years IS NULL OR r.year IN :years)
            AND (:periods IS NULL OR r.period IN :periods)
            AND (:periodKeys IS NULL OR CONCAT(CAST(r.interval AS String), '-', CAST(r.year AS String), '-', CAST(r.period AS String)) IN :periodKeys)
            AND ((:accountingRegimes IS NULL AND :accountingRegimeNotStated IS NULL)
                OR r.accountingRegime IN :accountingRegimes
                OR (:accountingRegimeNotStated = true AND (r.accountingRegime IS NULL
                    OR TRIM(r.accountingRegime) = ''
                    OR LOWER(TRIM(r.accountingRegime)) = 'not applicable')))
            AND (:attestedOnly IS NULL OR EXISTS (SELECT attested.id FROM ReportEntity attested
                WHERE attested.organisationId = r.organisationId
                AND attested.subType = r.subType
                AND attested.interval = r.interval
                AND attested.year = r.year
                AND attested.period = r.period
                AND attested.ver = r.ver
                AND attested.identityVerified = true
                AND EXISTS (SELECT c.prefixId FROM CredentialEntity c WHERE c.prefixId = attested.identifier)))
            AND (:blockChainHash IS NULL OR LOWER(r.txHash) LIKE :blockChainHash)
            AND (:currency IS NULL OR o.currencyId = :currency)
            AND (r.id in (SELECT MIN(sub.id) FROM ReportEntity sub
                WHERE sub.ver = (SELECT MAX(latest.ver) FROM ReportEntity latest
                    WHERE latest.organisationId = sub.organisationId
                    AND latest.subType = sub.subType
                    AND latest.interval = sub.interval
                    AND latest.year = sub.year
                    AND latest.period = sub.period)
                GROUP BY sub.organisationId, sub.subType, sub.interval, sub.year, sub.period))
            """)
    Page<ReportEntity> findFirstByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriod(
            @Param("organisationId") String organisationId,
            @Param("blockChainHash") String blockChainHash,
            @Param("currency") String currency,
            @Param("subTypes") List<String> subTypes,
            @Param("intervals") List<Interval> intervals,
            @Param("years") List<Integer> years,
            @Param("periods") List<Integer> periods,
            @Param("periodKeys") List<String> periodKeys,
            @Param("accountingRegimes") List<String> accountingRegimes,
            @Param("accountingRegimeNotStated") Boolean accountingRegimeNotStated,
            @Param("attestedOnly") Boolean attestedOnly,
            Pageable pageable);

    @Query("""
            SELECT r FROM ReportEntity r
            WHERE r.organisationId = :organisationId
            AND r.subType = :reportType
            AND r.year >= :startYear AND r.year <= :endYear
            """)
    Set<ReportEntity> findByTypeAndWithinYearRange(
            @Param("organisationId") String organisationId,
            @Param("reportType") String reportType,
            @Param("startYear") int startYear,
            @Param("endYear") int endYear);

    Optional<ReportEntity> findByTxHash(String txHash);

    List<ReportEntity> findByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriodAndVer(
            String organisationId, String subType, Interval interval, Integer year, Integer period, Long ver);

    Optional<ReportEntity> findFirstByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriodAndVerNotNullOrderByVerDescIdAsc(
            String organisationId, String subType, Interval interval, Integer year, Integer period);

    @Query("""
            SELECT NEW org.cardanofoundation.reeve.indexer.model.view.OrganisationLastUpdatedView(r.organisationId, MAX(r.blockTime))
            FROM ReportEntity r
            WHERE r.blockTime IS NOT NULL
            GROUP BY r.organisationId
            """)
    List<OrganisationLastUpdatedView> findLastUpdatedPerOrganisation();

    @Query("""
            SELECT DISTINCT r.accountingRegime FROM ReportEntity r
            WHERE r.organisationId = :orgId
            AND (r.id in (SELECT MIN(sub.id) FROM ReportEntity sub
                WHERE sub.ver = (SELECT MAX(latest.ver) FROM ReportEntity latest
                    WHERE latest.organisationId = sub.organisationId
                    AND latest.subType = sub.subType
                    AND latest.interval = sub.interval
                    AND latest.year = sub.year
                    AND latest.period = sub.period)
                GROUP BY sub.organisationId, sub.subType, sub.interval, sub.year, sub.period))
            """)
    Page<String> findDistinctAccountingRegimesByOrganisationId(@Param("orgId") String orgId, Pageable pageable);

}
