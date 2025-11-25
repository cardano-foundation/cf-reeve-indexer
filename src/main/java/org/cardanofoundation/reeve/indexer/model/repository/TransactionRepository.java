package org.cardanofoundation.reeve.indexer.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionEntity;
import org.cardanofoundation.reeve.indexer.model.view.EventCodeView;

public interface TransactionRepository extends JpaRepository<TransactionEntity, String> {

    @Query("SELECT DISTINCT t.internalNumber FROM TransactionEntity t WHERE t.organisationId = :orgId")
    List<String> findDistinctInternalNumbersByOrganisationId(@Param("orgId") String orgId);

    @Query("SELECT DISTINCT ti.documentNumber FROM TransactionEntity t " +
           "JOIN t.items ti " +
           "WHERE t.organisationId = :orgId AND ti.documentNumber IS NOT NULL")
    List<String> findDistinctDocumentNumbersByOrganisationId(@Param("orgId") String orgId);

    @Query("SELECT DISTINCT ti.vatCustCode FROM TransactionEntity t " +
           "JOIN t.items ti " +
           "WHERE t.organisationId = :orgId AND ti.vatCustCode IS NOT NULL")
    List<String> findDistinctVatCustCodesByOrganisationId(@Param("orgId") String orgId);

    @Query("SELECT DISTINCT ti.costCenterCustCode FROM TransactionEntity t " +
           "JOIN t.items ti " +
           "WHERE t.organisationId = :orgId AND ti.costCenterCustCode IS NOT NULL")
    List<String> findDistinctCostCenterCustCodesByOrganisationId(@Param("orgId") String orgId);

    @Query("SELECT DISTINCT t.type FROM TransactionEntity t WHERE t.organisationId = :orgId")
    List<String> findDistinctTransactionTypesByOrganisationId(@Param("orgId") String orgId);

    @Query("SELECT DISTINCT ti.counterPartyCustCode FROM TransactionEntity t " +
           "JOIN t.items ti " +
           "WHERE t.organisationId = :orgId AND ti.counterPartyCustCode IS NOT NULL")
    List<String> findDistinctCounterPartyAccountNamesByOrganisationId(@Param("orgId") String orgId);

    @Query("SELECT DISTINCT ti.counterPartyCustCode FROM TransactionEntity t " +
           "JOIN t.items ti " +
           "WHERE t.organisationId = :orgId AND ti.counterPartyCustCode IS NOT NULL")
    List<String> findDistinctCounterPartyCustCodesByOrganisationId(@Param("orgId") String orgId);

    @Query("SELECT NEW org.cardanofoundation.reeve.indexer.model.view.EventCodeView(ti.eventCode, ti.eventName) " +
           "FROM TransactionEntity t " +
           "JOIN t.items ti " +
           "WHERE t.organisationId = :orgId AND ti.eventCode IS NOT NULL " +
           "GROUP BY ti.eventCode, ti.eventName")
    List<EventCodeView> findDistinctEventCodeNamePairsByOrganisationId(@Param("orgId") String orgId);
}
