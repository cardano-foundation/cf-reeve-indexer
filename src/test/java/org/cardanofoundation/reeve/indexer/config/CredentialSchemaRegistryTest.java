package org.cardanofoundation.reeve.indexer.config;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

class CredentialSchemaRegistryTest {

    private static CredentialSchemaRegistry registryFor(List<CredentialSchema> schemas) {
        KeriProperties properties = new KeriProperties();
        properties.setCredentialSchemas(schemas);
        CredentialSchemaRegistry registry = new CredentialSchemaRegistry(properties);
        registry.init();
        return registry;
    }

    private static CredentialSchema schema(String said, String name) {
        return new CredentialSchema(said, name, false, List.of(), List.of(), List.of());
    }

    @Test
    void forSaidReturnsTheConfiguredSchema() {
        CredentialSchemaRegistry registry = registryFor(List.of(schema("SAID1", "vLEI Legal Entity")));

        Optional<CredentialSchema> found = registry.forSaid("SAID1");

        assertTrue(found.isPresent());
        assertEquals("vLEI Legal Entity", found.get().name());
    }

    @Test
    void forSaidReturnsEmptyForAnUnknownSaid() {
        CredentialSchemaRegistry registry = registryFor(List.of(schema("SAID1", "vLEI Legal Entity")));

        assertTrue(registry.forSaid("unknown-said").isEmpty());
    }

    @Test
    void forSaidReturnsEmptyForABlankOrNullSaid() {
        CredentialSchemaRegistry registry = registryFor(List.of(schema("SAID1", "vLEI Legal Entity")));

        assertTrue(registry.forSaid(null).isEmpty());
        assertTrue(registry.forSaid("").isEmpty());
        assertTrue(registry.forSaid("   ").isEmpty());
    }

    @Test
    void duplicateSaidsKeepTheFirstEntry() {
        CredentialSchemaRegistry registry = registryFor(List.of(
                schema("SAID1", "First"),
                schema("SAID1", "Second")));

        Optional<CredentialSchema> found = registry.forSaid("SAID1");

        assertTrue(found.isPresent());
        assertEquals("First", found.get().name());
        assertEquals(1, registry.all().size());
    }

    @Test
    void emptyConfigProducesAnEmptyRegistry() {
        CredentialSchemaRegistry registry = registryFor(List.of());

        assertTrue(registry.all().isEmpty());
        assertTrue(registry.forSaid("anything").isEmpty());
    }

    @Test
    void nullConfigProducesAnEmptyRegistry() {
        CredentialSchemaRegistry registry = registryFor(null);

        assertTrue(registry.all().isEmpty());
    }

    @Test
    void schemasWithBlankSaidAreSkippedRatherThanRegistered() {
        CredentialSchemaRegistry registry = registryFor(List.of(schema("", "blank"), schema("   ", "blank2")));

        assertTrue(registry.all().isEmpty());
    }
}
