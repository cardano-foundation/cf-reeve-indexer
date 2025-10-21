package org.cardanofoundation.reeve.indexer.yaci.contract;

import java.util.List;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;

import com.bloxbean.cardano.client.address.AddressProvider;
import com.bloxbean.cardano.client.common.model.Network;
import com.bloxbean.cardano.client.plutus.spec.PlutusScript;
import com.bloxbean.cardano.yaci.store.common.domain.AddressUtxo;
import com.bloxbean.cardano.yaci.store.common.domain.TxInput;
import com.bloxbean.cardano.yaci.store.utxo.storage.impl.UtxoCache;
import com.bloxbean.cardano.yaci.store.utxo.storage.impl.UtxoStorageImpl;
import com.bloxbean.cardano.yaci.store.utxo.storage.impl.repository.TxInputRepository;
import com.bloxbean.cardano.yaci.store.utxo.storage.impl.repository.UtxoRepository;
import org.jooq.DSLContext;

@Component
@Slf4j
public class CustomUtxoStorage extends UtxoStorageImpl {

    private final String scriptAddress;

    public CustomUtxoStorage(UtxoRepository utxoRepository,
            TxInputRepository spentOutputRepository, DSLContext dsl, UtxoCache utxoCache,
            PlatformTransactionManager transactionManager, PlutusScript plutusScript, Network network) {
        super(utxoRepository, spentOutputRepository, dsl, utxoCache, transactionManager);
        this.scriptAddress = AddressProvider.getEntAddress(plutusScript, network).getAddress();
    }

    // Saving nothing as we are not interested at spent utxos
    @Override
    public void saveSpent(List<TxInput> txInputs) {
        super.saveSpent(List.of());
    }

    @Override
    public void saveUnspent(List<AddressUtxo> addressUtxos) {
        super.saveUnspent(addressUtxos.stream().filter(au -> au.getOwnerAddr().equals(scriptAddress)).toList());
    }

}
