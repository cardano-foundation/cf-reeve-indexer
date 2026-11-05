package org.cardanofoundation.reeve.indexer.config;

import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;

/**
 * Indexes the configured {@code keri.credential-schemas} by schema SAID.
 *
 * <p>Unconditional (not gated on {@code keri.enabled}) so that consumers depending on it don't
 * break application context startup when KERI is disabled; it is empty-safe in that case since
 * {@link KeriProperties#getCredentialSchemas()} defaults to an empty list.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CredentialSchemaRegistry {

    private final KeriProperties keriProperties;

    private final Map<String, CredentialSchema> bySaid = new LinkedHashMap<>();

    @PostConstruct
    void init() {
        List<CredentialSchema> schemas = keriProperties.getCredentialSchemas();
        if (schemas == null) {
            return;
        }
        for (CredentialSchema schema : schemas) {
            if (schema == null || schema.said() == null || schema.said().isBlank()) {
                log.warn("Skipping credential schema with missing SAID: {}", schema);
                continue;
            }
            CredentialSchema previous = bySaid.putIfAbsent(schema.said(), schema);
            if (previous != null) {
                log.warn("Duplicate credential schema SAID '{}' (name='{}') ignored; keeping first entry '{}'",
                        schema.said(), schema.name(), previous.name());
            }
        }
        log.info("CredentialSchemaRegistry initialized with {} schema(s)", bySaid.size());
    }

    public Optional<CredentialSchema> forSaid(String said) {
        if (said == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(bySaid.get(said));
    }

    public Collection<CredentialSchema> all() {
        return Collections.unmodifiableCollection(bySaid.values());
    }
}
