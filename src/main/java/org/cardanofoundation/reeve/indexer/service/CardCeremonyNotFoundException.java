package org.cardanofoundation.reeve.indexer.service;

/**
 * No card-attestation ceremony exists with the given id. Semantically a "404 Not Found" — a REST
 * layer (A6) can map this directly. Ported (as a plain exception, no {@code ProblemDetail}/{@code
 * Either} plumbing) from the platform's {@code keri_attestation} module's {@code
 * KeriAttestationProblems#CEREMONY_NOT_FOUND}, mirroring {@link KeriOobiValidationException}'s style.
 */
public class CardCeremonyNotFoundException extends RuntimeException {

    public CardCeremonyNotFoundException(String message) {
        super(message);
    }
}
