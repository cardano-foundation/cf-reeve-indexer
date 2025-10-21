package org.cardanofoundation.reeve.indexer.yaci.contract;

import java.util.List;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bloxbean.cardano.client.exception.CborSerializationException;
import com.bloxbean.cardano.client.plutus.spec.PlutusScript;
import com.bloxbean.cardano.client.util.HexUtil;
import com.bloxbean.cardano.yaci.store.script.domain.TxScript;
import com.bloxbean.cardano.yaci.store.script.storage.impl.TxScriptStorageImpl;
import com.bloxbean.cardano.yaci.store.script.storage.impl.mapper.ScriptMapper;
import com.bloxbean.cardano.yaci.store.script.storage.impl.repository.TxScriptRepository;

@Component
@Slf4j
public class CustomTransactionProcessor extends TxScriptStorageImpl {

    private final String scriptHash;

    public CustomTransactionProcessor(TxScriptRepository txScriptRepository,
            ScriptMapper scriptMapper, PlutusScript plutusScript) throws CborSerializationException {
        super(txScriptRepository, scriptMapper);
        this.scriptHash = HexUtil.encodeHexString(plutusScript.getScriptHash());
    }

    @Override
    @Transactional
    public void saveAll(List<TxScript> txScripts) {
        super.saveAll(txScripts.stream().filter(t -> Optional.ofNullable(t.getScriptHash()).orElse("").equals(scriptHash)).toList());
    }
}
