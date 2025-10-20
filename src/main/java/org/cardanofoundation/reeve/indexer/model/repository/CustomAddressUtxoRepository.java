package org.cardanofoundation.reeve.indexer.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bloxbean.cardano.yaci.store.utxo.storage.impl.model.AddressUtxoEntity;
import com.bloxbean.cardano.yaci.store.utxo.storage.impl.model.UtxoId;

@Repository
public interface CustomAddressUtxoRepository extends JpaRepository<AddressUtxoEntity, UtxoId> {

    @Query("SELECT a FROM AddressUtxoEntity a WHERE CAST(a.amounts as string) LIKE CONCAT('%', :assetName, '%')")
    List<AddressUtxoEntity> findByAssetName(@Param("assetName") String assetName);

    @Query("SELECT a FROM AddressUtxoEntity a WHERE CAST(a.amounts as string) LIKE CONCAT('%', :assetName, '%') ORDER BY a.blockTime DESC LIMIT 1")
    Optional<AddressUtxoEntity> findLatestByAssetName(@Param("assetName") String assetName);
}
