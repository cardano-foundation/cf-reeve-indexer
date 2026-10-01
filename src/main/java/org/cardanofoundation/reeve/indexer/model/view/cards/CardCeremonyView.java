package org.cardanofoundation.reeve.indexer.model.view.cards;

import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.model.domain.ceremony.CardCeremonyState;
import org.cardanofoundation.reeve.indexer.model.entity.CardAttestationCeremonyEntity;

/**
 * The card-attestation ceremony wizard's view of a single ceremony: its identity, the card it
 * attests, its current state-machine position, the indexer's own KERI agent OOBI (so the wizard
 * can render the pairing QR straight from whichever response it just got, with no separate call),
 * the fully-attested card once the ceremony completes, and — once the ceremony has FAILED a step
 * — the error the wizard should surface.
 *
 * <p>{@code agentOobi} is populated by the controller, not the ceremony entity itself (the entity
 * carries no such field) — best-effort, so a transient KERI-agent hiccup while building a response
 * never turns an otherwise-successful ceremony call into a 500; {@code null} when unavailable.
 *
 * <p>{@code card} is the exported, now-attested REEVE_KEY_CARD (its {@code attestation} block
 * populated), included ONLY once the ceremony reaches {@code ATTEST_ANCHORED} — the public wizard has
 * no operator credentials to call the gated {@code /{cardId}/export}, so this is how the holder
 * retrieves the attested card to import into the platform. {@code null} at every earlier state.
 *
 * <p>{@code presentedCredential} is what the paired wallet handed over, for display — populated from
 * {@code CREDENTIAL_RECEIVED} onward, {@code null} before that. It is NOT a verification result; see
 * {@link PresentedCredentialView}.
 *
 * <p>snake_case on the wire (no {@code @JsonNaming} override) — matches {@link CardViews}' own
 * convention for this same (cards) read API, per the app's global {@code
 * spring.jackson.property-naming-strategy: SNAKE_CASE}. The nested {@code card} keeps its own
 * camelCase (it is a pre-built {@code ObjectNode}, immune to the global snake_case strategy).
 */
public record CardCeremonyView(UUID ceremonyId, UUID cardId, CardCeremonyState state, String agentOobi,
        JsonNode card, PresentedCredentialView presentedCredential, String errorTitle, String errorDetail) {

    public static CardCeremonyView of(CardAttestationCeremonyEntity entity, String agentOobi, JsonNode card,
            CredentialSchemaRegistry schemaRegistry, ObjectMapper objectMapper) {
        return new CardCeremonyView(entity.getId(), entity.getCardId(), entity.getState(), agentOobi, card,
                PresentedCredentialView.of(entity, schemaRegistry, objectMapper).orElse(null),
                entity.getErrorTitle(), entity.getErrorDetail());
    }
}
