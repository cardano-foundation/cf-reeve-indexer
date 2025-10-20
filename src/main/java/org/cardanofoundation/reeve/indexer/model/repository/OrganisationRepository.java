package org.cardanofoundation.reeve.indexer.model.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;

public interface OrganisationRepository extends JpaRepository<OrganisationEntity, String>  {

    @Modifying
    @Query(value = "INSERT INTO reeve_organisation (id, name, currency_id, country_code, tax_id_number, tx_hash) " +
                   "VALUES (:id, :name, :currencyId, :countryCode, :taxIdNumber, :txHash) " +
                   "ON CONFLICT (id) DO NOTHING", nativeQuery = true)
    void saveIfNotExists(@Param("id") String id,
                        @Param("name") String name,
                        @Param("currencyId") String currencyId,
                        @Param("countryCode") String countryCode,
                        @Param("taxIdNumber") String taxIdNumber,
                        @Param("txHash") String txHash);

    Optional<OrganisationEntity> findByTxHash(String txHash);
}
