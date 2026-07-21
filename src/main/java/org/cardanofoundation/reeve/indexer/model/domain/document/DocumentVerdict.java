package org.cardanofoundation.reeve.indexer.model.domain.document;

/**
 * Overall verdict per §9.3: first failing check in contract order wins; PENDING while unresolved.
 * The publisher check was removed by design — VERIFIED asserts only that the bytes on IPFS match
 * what was anchored on Cardano L1 at this slot, making no claim about WHO anchored it.
 */
public enum DocumentVerdict {
    VERIFIED, MALFORMED_MANIFEST, IPFS_UNAVAILABLE,
    CONTENT_HASH_MISMATCH, MALFORMED_ENVELOPE, PENDING;

    public static DocumentVerdict compute(CheckStatus manifest, CheckStatus ipfs,
            CheckStatus contentHash, CheckStatus envelope) {
        if (manifest == CheckStatus.FAIL) return MALFORMED_MANIFEST;
        if (ipfs == CheckStatus.FAIL) return IPFS_UNAVAILABLE;
        if (contentHash == CheckStatus.FAIL) return CONTENT_HASH_MISMATCH;
        if (envelope == CheckStatus.FAIL) return MALFORMED_ENVELOPE;
        if (manifest == CheckStatus.PASS && ipfs == CheckStatus.PASS
                && contentHash == CheckStatus.PASS && envelope == CheckStatus.PASS) {
            return VERIFIED;
        }
        return PENDING;
    }
}
