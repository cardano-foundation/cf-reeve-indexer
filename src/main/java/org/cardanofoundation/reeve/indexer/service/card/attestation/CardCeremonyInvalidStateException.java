package org.cardanofoundation.reeve.indexer.service.card.attestation;

/**
 * A card-attestation ceremony was asked to begin a step it isn't currently positioned for (its
 * actual state doesn't match the expected/waiting state the caller assumed). Semantically a "409
 * Conflict" — a REST layer can map this directly. A plain exception (no {@code
 * ProblemDetail}/{@code Either} plumbing), mirroring {@link KeriOobiValidationException}'s style.
 */
public class CardCeremonyInvalidStateException extends RuntimeException {

    public CardCeremonyInvalidStateException(String message) {
        super(message);
    }
}
