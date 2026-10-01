package org.cardanofoundation.reeve.indexer.model.domain.document;

import static org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class DocumentVerdictTest {

    @Test
    void allPassIsVerified() {
        assertEquals(DocumentVerdict.VERIFIED, DocumentVerdict.compute(PASS, PASS, PASS, PASS));
    }

    @Test
    void firstFailingCheckInContractOrderWins() {
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, DocumentVerdict.compute(FAIL, FAIL, FAIL, FAIL));
        assertEquals(DocumentVerdict.IPFS_UNAVAILABLE, DocumentVerdict.compute(PASS, FAIL, PENDING, PENDING));
        assertEquals(DocumentVerdict.CONTENT_HASH_MISMATCH, DocumentVerdict.compute(PASS, PASS, FAIL, PASS));
        assertEquals(DocumentVerdict.MALFORMED_ENVELOPE, DocumentVerdict.compute(PASS, PASS, PASS, FAIL));
    }

    @Test
    void pendingChecksWithoutFailureIsPending() {
        assertEquals(DocumentVerdict.PENDING, DocumentVerdict.compute(PASS, PENDING, PASS, PASS));
        assertEquals(DocumentVerdict.PENDING, DocumentVerdict.compute(PASS, PENDING, PENDING, PENDING));
    }

    @Test
    void aFailAfterPendingStillReports() {
        // ipfs/content still pending but envelope already failed -> report the failure, not PENDING
        assertEquals(DocumentVerdict.MALFORMED_ENVELOPE, DocumentVerdict.compute(PASS, PENDING, PENDING, FAIL));
    }
}
