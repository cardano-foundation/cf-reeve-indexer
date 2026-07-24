package org.cardanofoundation.reeve.indexer.service;

/**
 * A {@link CardTxSubmitter} failed to build, sign or submit the CIP-170 {@code ATTEST} tx — a
 * network/backend failure (Blockfrost unreachable, node rejected the tx, insufficient funds in the
 * organiser wallet, ...), not a KERI/wallet problem. Kept as a plain unchecked exception (no {@code
 * vavr}, matching this app's convention — see {@code CardCeremonyService}'s own javadoc); {@link
 * CardAttestService} catches this once and turns it into a failed ceremony step.
 */
public class CardTxSubmissionException extends RuntimeException {

    public CardTxSubmissionException(String message) {
        super(message);
    }

    public CardTxSubmissionException(String message, Throwable cause) {
        super(message, cause);
    }
}
