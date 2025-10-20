package org.cardanofoundation.reeve.indexer.yaci.contract;

import java.util.Collection;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;

import com.bloxbean.cardano.yaci.store.common.config.StoreProperties;
import com.bloxbean.cardano.yaci.store.common.executor.ParallelExecutor;
import com.bloxbean.cardano.yaci.store.script.domain.Datum;
import com.bloxbean.cardano.yaci.store.script.storage.impl.DatumStorageImpl;
import com.bloxbean.cardano.yaci.store.script.storage.impl.repository.DatumRepository;
import org.jooq.DSLContext;

@Component
@Slf4j
public class CustomDatumStorage extends DatumStorageImpl {

    public CustomDatumStorage(DatumRepository datumRepository, DSLContext dsl,
            ParallelExecutor executorHelper, StoreProperties storeProperties,
            PlatformTransactionManager transactionManager) {
        super(datumRepository, dsl, executorHelper, storeProperties, transactionManager);
        // TODO Auto-generated constructor stub
    }

    @Override
    public void saveAll(Collection<Datum> DatumList) {
        log.debug("Skipping datum saveAll");
    }

}
