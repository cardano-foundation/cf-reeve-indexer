package org.cardanofoundation.reeve.indexer.processor;

import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;

/**
 * Strategy for persisting a single reeve metadata type. This is the extension point for new reeve
 * metadata types: implement this interface as a Spring {@code @Component} and the
 * {@link ReeveTypeProcessorRegistry} will route matching transactions to it automatically — no
 * changes to the storage layer are required.
 *
 * @see ReeveTypeProcessorRegistry
 */
public interface ReeveTypeProcessor {

    /** The reeve transaction type this processor handles. */
    ReeveTransactionType supportedType();

    /** Persists the already-parsed metadata of a single reeve transaction. */
    void process(ReeveMetadata metadata);
}
