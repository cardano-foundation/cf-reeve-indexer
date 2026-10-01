package org.cardanofoundation.reeve.indexer.service.card.attestation;

/**
 * A card-attestation ceremony's TTL has elapsed (lazily detected on read or on the next attempted
 * step). Semantically a "409 Conflict" — a REST layer can map this directly, distinctly from
 * {@link CardCeremonyInvalidStateException} so a caller can tell "wrong step" from "too late,
 * start over". A plain exception (no {@code ProblemDetail}/{@code Either} plumbing), mirroring
 * {@link KeriOobiValidationException}'s style.
 */
public class CardCeremonyExpiredException extends RuntimeException {

    public CardCeremonyExpiredException(String message) {
        super(message);
    }
}
