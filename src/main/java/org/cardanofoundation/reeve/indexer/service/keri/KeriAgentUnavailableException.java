package org.cardanofoundation.reeve.indexer.service.keri;

/**
 * The indexer's own KERI agent (KERIA) was merely unreachable or momentarily broken while
 * resolving an OOBI — not a rejection of the OOBI/AID itself. Semantically a "503 Service
 * Unavailable" — the caller should retry, not "fix" a URL that was never actually invalid. A REST
 * layer can map this to HTTP 503.
 */
public class KeriAgentUnavailableException extends RuntimeException {

    public KeriAgentUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
