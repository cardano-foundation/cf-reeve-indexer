package org.cardanofoundation.reeve.indexer.config;

import java.util.List;

/**
 * A trust registry entry for one KERI credential schema (identified by its schema SAID).
 *
 * <p>Two trust models are supported:
 * <ul>
 *   <li>{@code chained}: the credential chain must terminate in one of {@code trustedRoots}
 *       (e.g. vLEI: leaf credential chains up through a QVI to the GLEIF root AID).</li>
 *   <li>standalone ({@code chained = false}): the credential's issuer AID must be one of
 *       {@code trustedIssuers}; {@code trustedRoots} is unused in this case.</li>
 * </ul>
 *
 * @param said the schema SAID this entry governs
 * @param name human-readable schema name (used for display/logging)
 * @param chained whether trust is established via a chain terminating at {@code trustedRoots}
 *                (true) or via a direct issuer allow-list in {@code trustedIssuers} (false)
 * @param trustedRoots AIDs a chained credential's chain must terminate in; unused when standalone
 * @param trustedIssuers AIDs allowed to directly issue this schema; unused when chained
 * @param oobis OOBIs to resolve at startup so the issuer/registry/root KEL and TEL data needed to
 *              verify this schema's credentials is available
 */
public record CredentialSchema(
        String said,
        String name,
        boolean chained,
        List<String> trustedRoots,
        List<String> trustedIssuers,
        List<String> oobis) {
}
