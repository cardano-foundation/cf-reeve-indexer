package org.cardanofoundation.reeve.indexer.service.card.attestation;

/**
 * No card-attestation ceremony exists with the given id. Semantically a "404 Not Found" — a REST
 * layer can map this directly. A plain exception (no {@code ProblemDetail}/{@code Either}
 * plumbing), mirroring {@link KeriOobiValidationException}'s style.
 */
public class CardCeremonyNotFoundException extends RuntimeException {

    public CardCeremonyNotFoundException(String message) {
        super(message);
    }
}
