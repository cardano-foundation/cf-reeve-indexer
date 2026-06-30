package org.cardanofoundation.reeve.indexer.processor;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;

import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;

/**
 * Discovers all {@link ReeveTypeProcessor} beans and indexes them by their supported type, so the
 * storage layer can dispatch a parsed reeve transaction to the right processor without knowing the
 * concrete implementations. Adding support for a new reeve metadata type is therefore as simple as
 * adding a new {@link ReeveTypeProcessor} bean.
 */
@Component
@Slf4j
public class ReeveTypeProcessorRegistry {

    private final Map<ReeveTransactionType, ReeveTypeProcessor> processors =
            new EnumMap<>(ReeveTransactionType.class);

    public ReeveTypeProcessorRegistry(List<ReeveTypeProcessor> processorList) {
        processorList.forEach(processor -> {
            ReeveTypeProcessor previous = processors.put(processor.supportedType(), processor);
            if (previous != null) {
                log.warn("Multiple ReeveTypeProcessor beans registered for type {}: {} replaced {}",
                        processor.supportedType(),
                        processor.getClass().getSimpleName(),
                        previous.getClass().getSimpleName());
            }
        });
        log.info("Registered reeve type processors: {}", processors.keySet());
    }

    public Optional<ReeveTypeProcessor> find(ReeveTransactionType type) {
        return Optional.ofNullable(processors.get(type));
    }
}
