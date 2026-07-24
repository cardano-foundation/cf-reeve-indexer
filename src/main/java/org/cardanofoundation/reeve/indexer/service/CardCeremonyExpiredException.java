package org.cardanofoundation.reeve.indexer.service;

/**
 * A card-attestation ceremony's TTL has elapsed (lazily detected on read or on the next attempted
 * step). Semantically a "409 Conflict" — a REST layer (A6) can map this directly, distinctly from
 * {@link CardCeremonyInvalidStateException} so a caller can tell "wrong step" from "too late,
 * start over". Ported (as a plain exception, no {@code ProblemDetail}/{@code Either} plumbing) from
 * the platform's {@code keri_attestation} module's {@code
 * KeriAttestationProblems#CEREMONY_EXPIRED}, mirroring {@link KeriOobiValidationException}'s style.
 */
public class CardCeremonyExpiredException extends RuntimeException {

    public CardCeremonyExpiredException(String message) {
        super(message);
    }
}
