package org.cardanofoundation.reeve.indexer.service.document;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Optional;

import org.springframework.dao.OptimisticLockingFailureException;

import com.bloxbean.cardano.client.util.HexUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.processor.IpfsGatewayClient;

class DocumentEnvelopeVerifierTest {

    private IpfsGatewayClient ipfsGatewayClient;
    private DocumentRepository documentRepository;
    private DocumentEnvelopeVerifier verifier;

    private static final byte[] CIPHERTEXT = "ciphertext-bytes".getBytes(StandardCharsets.UTF_8);

    private static final int MAX_ATTEMPTS = 5;

    @BeforeEach
    void setUp() {
        ipfsGatewayClient = mock(IpfsGatewayClient.class);
        documentRepository = mock(DocumentRepository.class);
        // Envelope verification no longer touches identity correlation at all: the wallet attests the
        // published manifest, so nothing about correlation waits on the envelope bytes any more.
        verifier = new DocumentEnvelopeVerifier(ipfsGatewayClient, documentRepository,
                new ObjectMapper(), 3, MAX_ATTEMPTS);
    }

    // The verifier must fetch through the CAPPED byte path (never the uncapped String fetch), so a
    // hostile anchor cannot make it buffer an unbounded IPFS response. Every stub goes through here.
    private void stubEnvelopeBytes(String json) {
        when(ipfsGatewayClient.fetchBytes(eq("bafyexamplecid1"), anyLong()))
                .thenReturn(Optional.of(json.getBytes(StandardCharsets.UTF_8)));
    }

    private void stubFetchUnavailable() {
        when(ipfsGatewayClient.fetchBytes(eq("bafyexamplecid1"), anyLong()))
                .thenReturn(Optional.empty());
    }

    private static String sha256Hex(byte[] bytes) throws Exception {
        return HexUtil.encodeHexString(MessageDigest.getInstance("SHA-256").digest(bytes));
    }

    private DocumentEntity doc(String contentHash, int recipientCount) {
        return DocumentEntity.builder()
                .txHash("tx1").ipfsCid("bafyexamplecid1")
                .contentHash(contentHash).plaintextHash("b".repeat(64))
                .envelopeVersion(1).recipientCount(recipientCount)
                .organisationId("f".repeat(64))
                .manifestCheck(CheckStatus.PASS)
                .ipfsCheck(CheckStatus.PENDING).contentHashCheck(CheckStatus.PENDING)
                .envelopeCheck(CheckStatus.PENDING).verdict(DocumentVerdict.PENDING)
                .build();
    }

    // Builds the published envelope shape verbatim, including its frozen "slots"/"ephemeral_pub"/
    // "wrapped_dek" key names — the verifier has to keep reading exactly these.
    private String envelope(String contentHash, int recipientCount) {
        StringBuilder recipientJson = new StringBuilder();
        for (int i = 0; i < recipientCount; i++) {
            if (i > 0) recipientJson.append(',');
            recipientJson.append("{\"ephemeral_pub\":\"").append("c".repeat(64))
                    .append("\",\"wrapped_dek\":\"").append("d".repeat(96)).append("\"}");
        }
        return """
            {"version":1,"type":"REEVE_ENCRYPTED_DOCUMENT","org_id":"%s",
             "content_hash":"%s","plaintext_hash":"%s",
             "payload":{"ciphertext":"%s","nonce":"%s"},
             "slots":[%s]}
            """.formatted("f".repeat(64), contentHash, "b".repeat(64),
                Base64.getEncoder().encodeToString(CIPHERTEXT), "0".repeat(24), recipientJson);
    }

    @Test
    void validEnvelopeVerifies() throws Exception {
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 2);
        stubEnvelopeBytes(envelope(hash, 2));

        verifier.verify(entity);

        assertEquals(CheckStatus.PASS, entity.getIpfsCheck());
        assertEquals(CheckStatus.PASS, entity.getContentHashCheck());
        assertEquals(CheckStatus.PASS, entity.getEnvelopeCheck());
        assertEquals(DocumentVerdict.VERIFIED, entity.getVerdict());
        verify(documentRepository).save(entity);
    }

    @Test
    void fetchesThroughTheSharedCappedPathAndNeverTheUncappedFetch() throws Exception {
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 2);
        stubEnvelopeBytes(envelope(hash, 2));

        verifier.verify(entity);

        // The DoS fix: the verifier hits fetchBytes with the SAME cap the read proxy uses, and the
        // uncapped String fetch is never touched — a hostile anchor cannot force unbounded buffering.
        verify(ipfsGatewayClient).fetchBytes("bafyexamplecid1", IpfsGatewayClient.MAX_ENVELOPE_BYTES);
        verify(ipfsGatewayClient, never()).fetch(any());
    }

    @Test
    void oversizedEnvelopeIsTreatedAsUnavailableNotBuffered() {
        // An over-cap IPFS body makes fetchBytes return empty (see IpfsGatewayClientTest); the
        // verifier must then treat the row as a failed fetch — never PASS, never buffered whole.
        DocumentEntity entity = doc("9".repeat(64), 2);
        stubFetchUnavailable();

        verifier.verify(entity);

        assertEquals(CheckStatus.PENDING, entity.getIpfsCheck());
        assertNotEquals(DocumentVerdict.VERIFIED, entity.getVerdict());
        verify(ipfsGatewayClient, never()).fetch(any());
    }

    @Test
    void contentHashMismatchIsDetected() {
        DocumentEntity entity = doc("9".repeat(64), 2); // on-chain hash != real hash
        stubEnvelopeBytes(envelope("9".repeat(64), 2));

        verifier.verify(entity);

        assertEquals(CheckStatus.FAIL, entity.getContentHashCheck());
        assertEquals(DocumentVerdict.CONTENT_HASH_MISMATCH, entity.getVerdict());
    }

    @Test
    void recipientCountMismatchIsMalformedEnvelope() throws Exception {
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 5); // manifest claims 5 recipients, envelope carries 2
        stubEnvelopeBytes(envelope(hash, 2));

        verifier.verify(entity);

        assertEquals(CheckStatus.PASS, entity.getContentHashCheck());
        assertEquals(CheckStatus.FAIL, entity.getEnvelopeCheck());
        assertEquals(DocumentVerdict.MALFORMED_ENVELOPE, entity.getVerdict());
    }

    @Test
    void unparseableEnvelopeIsMalformedNotMismatch() {
        DocumentEntity entity = doc("9".repeat(64), 2);
        stubEnvelopeBytes("this is not json");

        verifier.verify(entity);

        assertEquals(CheckStatus.PASS, entity.getIpfsCheck()); // it DID fetch
        assertEquals(CheckStatus.PENDING, entity.getContentHashCheck()); // never computed
        assertEquals(CheckStatus.FAIL, entity.getEnvelopeCheck());
        assertEquals(DocumentVerdict.MALFORMED_ENVELOPE, entity.getVerdict());
    }

    @Test
    void unknownEnvelopeVersionIsMalformed() throws Exception {
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 2);
        String v2 = envelope(hash, 2).replace("\"version\":1", "\"version\":2");
        stubEnvelopeBytes(v2);

        verifier.verify(entity);

        assertEquals(CheckStatus.FAIL, entity.getEnvelopeCheck()); // never guess at unknown versions
    }

    @Test
    void fractionalEnvelopeVersionIsMalformedNotTruncatedToOne() throws Exception {
        // "version": 1.9 must not be truncated to 1 and accepted. canConvertToInt()/asInt()
        // alone would round it down; isIntegralNumber() rejects the fractional value outright,
        // matching the frontend's strict `version !== 1`.
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 2);
        String fractional = envelope(hash, 2).replace("\"version\":1", "\"version\":1.9");
        stubEnvelopeBytes(fractional);

        verifier.verify(entity);

        assertEquals(CheckStatus.FAIL, entity.getEnvelopeCheck());
        assertEquals(DocumentVerdict.MALFORMED_ENVELOPE, entity.getVerdict());
    }

    @Test
    void mutuallyConsistentButUnsupportedVersionIsStillMalformed() throws Exception {
        // Checks version support separately from mere manifest/envelope self-consistency: envelope
        // version and manifest envelope_version agree with EACH OTHER (both 2), but 2 is not the one
        // supported version — this must still FAIL, distinguishing it from
        // unknownEnvelopeVersionIsMalformed() above where the two disagree.
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 2);
        entity.setEnvelopeVersion(2);
        String v2 = envelope(hash, 2).replace("\"version\":1", "\"version\":2");
        stubEnvelopeBytes(v2);

        verifier.verify(entity);

        assertEquals(CheckStatus.FAIL, entity.getEnvelopeCheck());
        assertEquals(DocumentVerdict.MALFORMED_ENVELOPE, entity.getVerdict());
    }

    @Test
    void fetchFailureStaysPendingUntilAttemptThreshold() {
        DocumentEntity entity = doc("9".repeat(64), 2);
        stubFetchUnavailable();

        verifier.verify(entity); // attempt 1
        assertEquals(CheckStatus.PENDING, entity.getIpfsCheck());
        assertEquals(1, entity.getIpfsAttempts());
        verifier.verify(entity); // attempt 2
        verifier.verify(entity); // attempt 3 -> threshold
        assertEquals(CheckStatus.FAIL, entity.getIpfsCheck());
        assertEquals(DocumentVerdict.IPFS_UNAVAILABLE, entity.getVerdict());
    }

    @Test
    void exhaustingTheRetryBudgetCondemnsTheRowSoTheSweepStopsSelectingIt() {
        DocumentEntity entity = doc("9".repeat(64), 2);
        stubFetchUnavailable();

        for (int i = 0; i < MAX_ATTEMPTS; i++) {
            verifier.verify(entity);
        }

        assertEquals(MAX_ATTEMPTS, entity.getIpfsAttempts());
        assertEquals(CheckStatus.FAIL, entity.getIpfsCheck());
        // The terminal flag is what excludes this row from the scheduler's partial-index sweep, so a
        // forged/unresolvable anchor is never re-fetched or even index-walked once condemned.
        assertTrue(entity.isIpfsRetryExhausted());
    }

    @Test
    void aRowStillWithinTheBudgetIsNotYetCondemned() {
        DocumentEntity entity = doc("9".repeat(64), 2);
        stubFetchUnavailable();

        verifier.verify(entity); // attempt 1, well under MAX_ATTEMPTS

        assertFalse(entity.isIpfsRetryExhausted());
    }

    @Test
    void concurrentUpdateDuringSaveDoesNotPropagate() throws Exception {
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 2);
        stubEnvelopeBytes(envelope(hash, 2));
        when(documentRepository.save(any())).thenThrow(new OptimisticLockingFailureException(
                "lost update - concurrent reprocess of the same tx"));

        assertDoesNotThrow(() -> verifier.verify(entity));

        verify(documentRepository).save(entity);
    }

    @Test
    void lateFetchSuccessRecoversFromIpfsUnavailable() throws Exception {
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 2);
        entity.setIpfsCheck(CheckStatus.FAIL);
        entity.setIpfsAttempts(7);
        stubEnvelopeBytes(envelope(hash, 2));

        verifier.verify(entity);

        assertEquals(CheckStatus.PASS, entity.getIpfsCheck());
        assertEquals(DocumentVerdict.VERIFIED, entity.getVerdict());
    }
}
