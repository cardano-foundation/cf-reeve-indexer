package org.cardanofoundation.reeve.indexer.model.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Body of {@code POST /api/v1/cards/attestation/ceremonies} (attest-with-Veridian wizard, Option B):
 * the full client-built {@code REEVE_KEY_CARD} to register and immediately open an attestation
 * ceremony for. The card is a raw {@link JsonNode} (its own camelCase {@code {v, type, subject, key}}
 * shape) rather than a typed DTO so it is validated by {@code CardIssuanceService#issueEntityFromCard}
 * — the same allowlist / private-key rejection the operator {@code /issue} path uses — instead of
 * being silently coerced by binding.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CardCeremonyCreateRequest {

    private JsonNode card;
}
