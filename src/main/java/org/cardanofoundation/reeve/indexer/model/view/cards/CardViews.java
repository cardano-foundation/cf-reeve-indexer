package org.cardanofoundation.reeve.indexer.model.view.cards;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;

public final class CardViews {

    private CardViews() {
    }

    public record StatusView(boolean issuanceEnabled) {
    }

    /** Registry row - PUBLIC parts only, snake_case on the wire like the rest of the read API. */
    public record RegistryEntryView(UUID cardId, String subjectType, String subjectId,
            String displayName, String email, String organisationId, String publicKey,
            String label, String assurance, String keyCreatedAt, LocalDateTime createdAt) {

        public static RegistryEntryView from(IssuedCardEntity e) {
            return new RegistryEntryView(e.getCardId(), e.getSubjectType(), e.getSubjectId(),
                    e.getDisplayName(), e.getEmail(), e.getOrganisationId(), e.getPublicKey(),
                    e.getLabel(), e.getAssurance(), e.getKeyCreatedAt(), e.getCreatedAt());
        }
    }

    public record RegistryResponse(List<RegistryEntryView> content, long total, int totalPages,
            int page, int size) {
    }
}
