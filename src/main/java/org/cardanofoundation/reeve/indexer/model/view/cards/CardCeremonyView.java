package org.cardanofoundation.reeve.indexer.model.view.cards;

import java.util.UUID;

import org.cardanofoundation.reeve.indexer.model.domain.ceremony.CardCeremonyState;
import org.cardanofoundation.reeve.indexer.model.entity.CardAttestationCeremonyEntity;

/**
 * The card-attestation ceremony wizard's view of a single ceremony (design doc Part A / A6): its
 * identity, the card it attests, its current state-machine position, the indexer's own KERI agent
 * OOBI (so the wizard can render the pairing QR straight from whichever response it just got, with no
 * separate call), and — once the ceremony has FAILED a step — the error the wizard should surface.
 *
 * <p>{@code agentOobi} is populated by the controller, not the ceremony entity itself (the entity
 * carries no such field) — best-effort, so a transient KERI-agent hiccup while building a response
 * never turns an otherwise-successful ceremony call into a 500; {@code null} when unavailable.
 *
 * <p>snake_case on the wire (no {@code @JsonNaming} override) — matches {@link CardViews}' own
 * convention for this same (cards) read API, per the app's global {@code
 * spring.jackson.property-naming-strategy: SNAKE_CASE}.
 */
public record CardCeremonyView(UUID ceremonyId, UUID cardId, CardCeremonyState state, String agentOobi,
        String errorTitle, String errorDetail) {

    public static CardCeremonyView of(CardAttestationCeremonyEntity entity, String agentOobi) {
        return new CardCeremonyView(entity.getId(), entity.getCardId(), entity.getState(), agentOobi,
                entity.getErrorTitle(), entity.getErrorDetail());
    }
}
