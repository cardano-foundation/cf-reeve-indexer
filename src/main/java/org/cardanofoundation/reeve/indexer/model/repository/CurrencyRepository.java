package org.cardanofoundation.reeve.indexer.model.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.cardanofoundation.reeve.indexer.model.entity.CurrencyEntity;

public interface CurrencyRepository extends JpaRepository<CurrencyEntity, CurrencyEntity.Id> {

    @Modifying
    @Query(value = "INSERT INTO reeve_currency (organisation_id, currency_id, cust_code) " +
                   "VALUES (:orgId, :currencyId, :custCode) " +
                   "ON CONFLICT (organisation_id, currency_id) DO NOTHING", nativeQuery = true)
    void saveIfNotExists(@Param("orgId") String orgId,
                        @Param("currencyId") String currencyId,
                        @Param("custCode") String custCode);

    @Query("SELECT c FROM CurrencyEntity c WHERE c.id.orgId = :orgId")
    List<CurrencyEntity> findAllByOrgId(@Param("orgId") String orgId);
}
