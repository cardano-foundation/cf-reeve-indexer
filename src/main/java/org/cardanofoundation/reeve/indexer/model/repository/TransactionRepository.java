package org.cardanofoundation.reeve.indexer.model.repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionEntity;
import org.cardanofoundation.reeve.indexer.model.view.EventCodeView;
import org.cardanofoundation.reeve.indexer.model.view.ProjectView;

public interface TransactionRepository extends JpaRepository<TransactionEntity, String> {

    @Query(
            value = "SELECT DISTINCT NEW org.cardanofoundation.reeve.indexer.model.view.ProjectView(ti.projectCustCode, ti.projectName) " +
                    "FROM TransactionEntity t " +
                    "JOIN t.items ti " +
                    "WHERE t.organisationId = :orgId AND ti.projectCustCode IS NOT NULL " +
                    "GROUP BY ti.projectCustCode, ti.projectName",
            countQuery = "SELECT COUNT(DISTINCT ti.projectCustCode) " +
                    "FROM TransactionEntity t " +
                    "JOIN t.items ti " +
                    "WHERE t.organisationId = :orgId AND ti.projectCustCode IS NOT NULL"
    )
    Page<ProjectView> findDistinctProjectCodesAndNamesByOrganisationId(@Param("orgId") String orgId, Pageable pageable);

    @Query("SELECT DISTINCT t.internalNumber FROM TransactionEntity t WHERE t.organisationId = :orgId")
    Page<String> findDistinctInternalNumbersByOrganisationId(@Param("orgId") String orgId, Pageable pageable);

    @Query("SELECT DISTINCT ti.documentNumber FROM TransactionEntity t " +
           "JOIN t.items ti " +
           "WHERE t.organisationId = :orgId AND ti.documentNumber IS NOT NULL")
    Page<String> findDistinctDocumentNumbersByOrganisationId(@Param("orgId") String orgId, Pageable pageable);

    @Query("SELECT DISTINCT ti.vatCustCode FROM TransactionEntity t " +
           "JOIN t.items ti " +
           "WHERE t.organisationId = :orgId AND ti.vatCustCode IS NOT NULL")
    Page<String> findDistinctVatCustCodesByOrganisationId(@Param("orgId") String orgId, Pageable pageable);

    @Query("SELECT DISTINCT ti.costCenterCustCode FROM TransactionEntity t " +
           "JOIN t.items ti " +
           "WHERE t.organisationId = :orgId AND ti.costCenterCustCode IS NOT NULL")
    Page<String> findDistinctCostCenterCustCodesByOrganisationId(@Param("orgId") String orgId, Pageable pageable);

    @Query("SELECT DISTINCT t.type FROM TransactionEntity t WHERE t.organisationId = :orgId")
    Page<String> findDistinctTransactionTypesByOrganisationId(@Param("orgId") String orgId, Pageable pageable);

    @Query("SELECT DISTINCT ti.counterPartyCustCode FROM TransactionEntity t " +
           "JOIN t.items ti " +
           "WHERE t.organisationId = :orgId AND ti.counterPartyCustCode IS NOT NULL")
    Page<String> findDistinctCounterPartyAccountNamesByOrganisationId(@Param("orgId") String orgId, Pageable pageable);

    @Query("SELECT DISTINCT ti.counterPartyCustCode FROM TransactionEntity t " +
           "JOIN t.items ti " +
           "WHERE t.organisationId = :orgId AND ti.counterPartyCustCode IS NOT NULL")
    Page<String> findDistinctCounterPartyCustCodesByOrganisationId(@Param("orgId") String orgId, Pageable pageable);

    @Query(
            value = "SELECT NEW org.cardanofoundation.reeve.indexer.model.view.EventCodeView(ti.eventCode, ti.eventName) " +
                    "FROM TransactionEntity t " +
                    "JOIN t.items ti " +
                    "WHERE t.organisationId = :orgId AND ti.eventCode IS NOT NULL " +
                    "GROUP BY ti.eventCode, ti.eventName",
            countQuery = "SELECT COUNT(DISTINCT ti.eventCode) " +
                    "FROM TransactionEntity t " +
                    "JOIN t.items ti " +
                    "WHERE t.organisationId = :orgId AND ti.eventCode IS NOT NULL"
    )
    Page<EventCodeView> findDistinctEventCodeNamePairsByOrganisationId(@Param("orgId") String orgId, Pageable pageable);
}
