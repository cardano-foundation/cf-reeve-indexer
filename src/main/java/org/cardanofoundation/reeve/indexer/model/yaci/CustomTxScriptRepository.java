package org.cardanofoundation.reeve.indexer.model.yaci;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bloxbean.cardano.yaci.store.script.storage.impl.model.TxScriptEntity;

@Repository
public interface CustomTxScriptRepository extends JpaRepository<TxScriptEntity, UUID> {

    @Query("SELECT t FROM TxScriptEntity t WHERE t.txHash = :txHash ORDER BY t.id DESC LIMIT 1")
    Optional<TxScriptEntity> findLatestByTxHash(@Param("txHash") String txHash);

}
