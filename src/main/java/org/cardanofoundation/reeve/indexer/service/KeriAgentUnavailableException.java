package org.cardanofoundation.reeve.indexer.service;

/**
 * The indexer's own KERI agent (KERIA) was merely unreachable or momentarily broken while
 * resolving an OOBI — not a rejection of the OOBI/AID itself. Semantically a "503 Service
 * Unavailable" — the caller should retry, not "fix" a URL that was never actually invalid. Ported
 * from the platform's {@code keri_attestation} module's {@code KeriOobiService#isTransientAgentFailure}
 * / {@code KeriAttestationProblems#KERI_AGENT_UNAVAILABLE}, minus that module's {@code
 * ProblemDetail}/{@code Either} plumbing (not present in this app) — a REST layer (A5) can map
 * this to HTTP 503.
 */
public class KeriAgentUnavailableException extends RuntimeException {

    public KeriAgentUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
