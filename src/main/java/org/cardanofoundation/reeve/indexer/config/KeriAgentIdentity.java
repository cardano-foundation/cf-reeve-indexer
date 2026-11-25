package org.cardanofoundation.reeve.indexer.config;

/**
 * The indexer's own KERI agent identity — its AID {@code prefix} and the {@code name} (alias) it
 * was created/looked up under ({@code keri.identifier-name}). Bootstrapped once at startup by
 * {@link KeriConfig#keriAgentIdentity} (get-or-create, WITH witnesses, plus the "agent" end-role)
 * and exposed as a bean so downstream consumers (e.g. {@code CardAttestationOobiService}) never
 * need to touch identifier creation themselves.
 */
public record KeriAgentIdentity(String prefix, String name) {
}
