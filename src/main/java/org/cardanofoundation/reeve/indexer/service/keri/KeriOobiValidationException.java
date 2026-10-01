package org.cardanofoundation.reeve.indexer.service.keri;

/**
 * A wallet OOBI URL/AID is genuinely bad: malformed, wrong scheme, missing the {@code /oobi/{aid}}
 * segment, or the KERI agent reached it fine but the AID never landed in {@code contacts()}.
 * Semantically a "422 Unprocessable Entity" — the caller sent something the agent understood and
 * rejected (or that never validated in the first place), not a transient outage. A REST layer can
 * map this to HTTP 422.
 */
public class KeriOobiValidationException extends RuntimeException {

    public KeriOobiValidationException(String message) {
        super(message);
    }

    public KeriOobiValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
