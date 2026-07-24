package org.cardanofoundation.reeve.indexer.service;

/**
 * A card-attestation ceremony was asked to begin a step it isn't currently positioned for (its
 * actual state doesn't match the expected/waiting state the caller assumed). Semantically a "409
 * Conflict" — a REST layer (A6) can map this directly. Ported (as a plain exception, no {@code
 * ProblemDetail}/{@code Either} plumbing) from the platform's {@code keri_attestation} module's
 * {@code KeriAttestationProblems#CEREMONY_INVALID_STATE}, mirroring {@link
 * KeriOobiValidationException}'s style.
 */
public class CardCeremonyInvalidStateException extends RuntimeException {

    public CardCeremonyInvalidStateException(String message) {
        super(message);
    }
}
