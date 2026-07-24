package org.cardanofoundation.reeve.indexer.service;

/**
 * A wallet OOBI URL/AID is genuinely bad: malformed, wrong scheme, missing the {@code /oobi/{aid}}
 * segment, or the KERI agent reached it fine but the AID never landed in {@code contacts()}.
 * Semantically a "422 Unprocessable Entity" — the caller sent something the agent understood and
 * rejected (or that never validated in the first place), not a transient outage. Ported from the
 * platform's {@code keri_attestation} module's {@code KeriOobiService}/{@code
 * KeriAttestationProblems#OOBI_INVALID}, minus that module's {@code ProblemDetail}/{@code Either}
 * plumbing (not present in this app) — a REST layer (A5) can map this to HTTP 422.
 */
public class KeriOobiValidationException extends RuntimeException {

    public KeriOobiValidationException(String message) {
        super(message);
    }

    public KeriOobiValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
