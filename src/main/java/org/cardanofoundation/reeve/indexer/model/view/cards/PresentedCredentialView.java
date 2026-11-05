package org.cardanofoundation.reeve.indexer.model.view.cards;

import java.util.Map;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.config.CredentialSchema;
import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.model.entity.CardAttestationCeremonyEntity;

/**
 * What the paired wallet PRESENTED during a card-attestation ceremony, for the wizard to show a person
 * instead of an opaque SAID.
 *
 * <p><b>Nothing here is verified.</b> The indexer is a permissionless public component and
 * deliberately accepts whatever credential a wallet hands it — unknown schema, untrusted issuer,
 * revoked, self-issued, all of it (see {@code KeriService#readPresentedCredential}). The platform's
 * import verifier is the gate that matters. This view therefore exists to answer "what was handed
 * over?", never "is it good?", and its wire field is named {@code presented_credential} rather than
 * anything containing "verified" so a consumer cannot mistake one question for the other.
 *
 * <p>{@code schemaName} is the display name of a CONFIGURED schema, resolved through
 * {@link CredentialSchemaRegistry}. It is {@code null} for a schema the indexer does not recognise —
 * which is a legitimate presentation here, not an error, so the wizard shows the raw
 * {@code schemaSaid} in that case. Recognising a schema is emphatically not trusting the credential:
 * the registry lookup is a label, not a check.
 *
 * <p>{@code claims} is the credential's attribute block minus its structural keys, exactly as
 * presented — a Foundation Employee's name and role, a vLEI's LEI, whatever the schema carries. The
 * wizard renders it generically, so a new schema needs no code here.
 *
 * <p>snake_case on the wire, matching the rest of this (cards) read API.
 */
@Slf4j
public record PresentedCredentialView(String credentialSaid, String schemaSaid, String schemaName,
        String issuerAid, Map<String, Object> claims) {

    /**
     * @return the presented credential, or empty when this ceremony has not reached
     *         {@code CREDENTIAL_RECEIVED} (nothing has been presented yet) or predates the columns.
     */
    public static Optional<PresentedCredentialView> of(CardAttestationCeremonyEntity entity,
            CredentialSchemaRegistry schemaRegistry, ObjectMapper objectMapper) {
        if (entity.getCredentialSaid() == null) {
            return Optional.empty();
        }
        String schemaName = entity.getSchemaSaid() == null ? null
                : schemaRegistry.forSaid(entity.getSchemaSaid()).map(CredentialSchema::name).orElse(null);

        return Optional.of(new PresentedCredentialView(entity.getCredentialSaid(), entity.getSchemaSaid(),
                schemaName, entity.getCredentialIssuerAid(),
                parseClaims(entity.getCredentialClaims(), objectMapper, entity.getId())));
    }

    /**
     * @return the stored claims, or an empty map. Display-only data must never be able to fail a
     *         ceremony response, so unparseable claims degrade to "no claims" rather than throwing.
     */
    private static Map<String, Object> parseClaims(String claimsJson, ObjectMapper objectMapper,
            Object ceremonyId) {
        if (claimsJson == null || claimsJson.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(claimsJson, new TypeReference<Map<String, Object>>() {
            });
        } catch (Exception e) {
            log.warn("Could not parse the stored presented-credential claims for ceremony {}: {}", ceremonyId,
                    e.getMessage());
            return Map.of();
        }
    }
}
