package org.cardanofoundation.reeve.indexer.config;

import java.io.File;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.bloxbean.cardano.client.common.model.Network;
import com.bloxbean.cardano.client.common.model.Networks;
import com.bloxbean.cardano.client.plutus.blueprint.PlutusBlueprintLoader;
import com.bloxbean.cardano.client.plutus.blueprint.PlutusBlueprintUtil;
import com.bloxbean.cardano.client.plutus.blueprint.model.PlutusContractBlueprint;
import com.bloxbean.cardano.client.plutus.blueprint.model.PlutusVersion;
import com.bloxbean.cardano.client.plutus.spec.PlutusScript;

/**
 * NOTE: This is an experimental feature to support Cardano smart contracts (Plutus scripts) related indexing.
*/
@Configuration
public class CardanoContractConfig {

    @Bean
    PlutusScript plutusScript(@Value("${reeve.script-path}") String filePath) {
        File plutusFile = new File(filePath);
        PlutusContractBlueprint blueprint = PlutusBlueprintLoader.loadBlueprint(plutusFile);
        String compiledCode = blueprint.getValidators().getFirst().getCompiledCode();
                return PlutusBlueprintUtil.getPlutusScriptFromCompiledCode(compiledCode,
                                PlutusVersion.v3);
    }

    // TODO replace with a proper network config
    @Bean
    public Network network() {
        return Networks.testnet();
    }

}
