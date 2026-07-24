package org.cardanofoundation.reeve.indexer.model.response;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.config.CredentialSchema;
import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity;

/**
 * Generic, schema-aware verified-identity DTO. Supersedes the vLEI-only {@code LEIResponse}:
 * every credential schema (vLEI or otherwise) projects into this same shape, with {@code lei}
 * retained (nullable) purely for frontend backward compatibility.
 *
 * <p>Used by both {@code ReportView.identities} (grouped by metadataHash, so a report may carry
 * several) and {@code DocumentView.identities} (a document correlates 1:1 by its own identifier,
 * so at most one element).
 */
@AllArgsConstructor
@RequiredArgsConstructor
@Builder
@Getter
@Slf4j
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class IdentityAttestationView {

    private boolean identityVerified;
    private String aid;
    private String schemaSaid;
    private String schemaName;
    private Map<String, Object> claims;
    private String lei;
    private String txHash;
    private String credentialTxHash;

    /**
     * Projects a verified {@link CredentialEntity} (matched to the presenting {@code aid} by the
     * caller) into an {@link IdentityAttestationView}. Shared by {@code ReportService} and
     * {@code DocumentService} so both assemble the DTO identically.
     *
     * @param aid the identifier/AID the credential is presented for (also the credential lookup key)
     * @param txHash the txHash of the attesting (report/document) entity, not the credential's own tx
     * @param credential the resolved credential row
     * @param schemaRegistry resolves {@code credential.schemaSaid} to a human-readable name
     * @param objectMapper parses {@code credential.claims} JSON into a map
     */
    public static IdentityAttestationView from(String aid, String txHash, CredentialEntity credential,
            CredentialSchemaRegistry schemaRegistry, ObjectMapper objectMapper) {
        String schemaSaid = credential.getSchemaSaid();
        String schemaName = schemaRegistry.forSaid(schemaSaid)
                .map(CredentialSchema::name)
                .orElse(schemaSaid);

        return IdentityAttestationView.builder()
                .identityVerified(true)
                .aid(aid)
                .schemaSaid(schemaSaid)
                .schemaName(schemaName)
                .claims(parseClaims(credential.getClaims(), objectMapper))
                .lei(credential.getLei())
                .txHash(txHash)
                .credentialTxHash(credential.getTxHash())
                .build();
    }

    private static Map<String, Object> parseClaims(String claimsJson, ObjectMapper objectMapper) {
        if (claimsJson == null || claimsJson.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(claimsJson, new TypeReference<Map<String, Object>>() { });
        } catch (JsonProcessingException e) {
            log.warn("Failed to parse credential claims JSON, omitting claims from view", e);
            return null;
        }
    }
}
