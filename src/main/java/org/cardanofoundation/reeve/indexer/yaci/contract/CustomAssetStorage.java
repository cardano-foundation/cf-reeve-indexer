package org.cardanofoundation.reeve.indexer.yaci.contract;

import java.util.List;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;

import com.bloxbean.cardano.client.exception.CborSerializationException;
import com.bloxbean.cardano.client.plutus.spec.PlutusScript;
import com.bloxbean.cardano.yaci.store.assets.domain.TxAsset;
import com.bloxbean.cardano.yaci.store.assets.storage.impl.AssetStorageImpl;
import com.bloxbean.cardano.yaci.store.assets.storage.impl.mapper.AssetMapper;
import com.bloxbean.cardano.yaci.store.assets.storage.impl.repository.TxAssetRepository;

@Component
@Slf4j
public class CustomAssetStorage extends AssetStorageImpl {

    private final String policyId;

    public CustomAssetStorage(TxAssetRepository txAssetRepository, AssetMapper assetMapper, PlutusScript plutusScript) throws CborSerializationException {
        super(txAssetRepository, assetMapper);
        this.policyId = plutusScript.getPolicyId();
    }

    @Override
    public void saveAll(List<TxAsset> txAssetList) {
        super.saveAll(txAssetList.stream().filter(asset -> asset.getPolicy().equals(policyId)).toList());
    }

}
