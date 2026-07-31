package org.cardanofoundation.reeve.indexer.service.document;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;

/** Retries the IPFS-unresolved envelope checks out-of-band, bounded so a hostile CID cannot loop forever. */
@Component
@Slf4j
public class DocumentVerificationScheduler {

    private final DocumentRepository documentRepository;
    private final DocumentEnvelopeVerifier envelopeVerifier;
    private final int maxBatch;

    public DocumentVerificationScheduler(DocumentRepository documentRepository,
            DocumentEnvelopeVerifier envelopeVerifier,
            @Value("${indexer.verification.max-batch-per-tick:200}") int maxBatch) {
        this.documentRepository = documentRepository;
        this.envelopeVerifier = envelopeVerifier;
        this.maxBatch = maxBatch;
    }

    @Scheduled(fixedDelayString = "${indexer.verification.retry-interval-ms:300000}",
            initialDelayString = "${indexer.verification.retry-interval-ms:300000}")
    public void retryUnresolved() {
        // Two independent bounds keep publisher-less verification from being weaponised:
        //  - PER ROW: DocumentEnvelopeVerifier condemns a row (sets ipfsRetryExhausted) once it has
        //    been attempted maxAttempts times; a condemned row is never selected again, so a forged
        //    valid-manifest anchor pointing ipfs_cid at attacker content cannot drive unbounded
        //    repeated fetches. A transient gateway failure still recovers within the window. Each
        //    fetch is additionally capped at IpfsGatewayClient.MAX_ENVELOPE_BYTES.
        //  - PER TICK: at most maxBatch rows are loaded/verified per query per run, and — because
        //    condemned rows carry ipfsRetryExhausted = true and a partial index excludes them — the
        //    sweep does not even index-walk the flood. A flood of forged manifests drains over
        //    successive ticks. Oldest-first (slot ASC) ordering is stable and keeps legitimate older
        //    rows ahead of freshly-anchored hostile ones (no starvation).
        //
        // FAIL before PENDING: verify() can flip a PENDING row to FAIL mid-loop once it crosses
        // failAfterAttempts. Querying FAIL first means that freshly-failed row is already past the
        // FAIL query and isn't picked up again in the same tick — querying PENDING first would
        // double-fetch/double-count-attempts on the row that just crossed the threshold.
        Pageable batch = PageRequest.of(0, maxBatch, Sort.by(Sort.Direction.ASC, "slot"));
        documentRepository
                .findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
                        CheckStatus.PASS, CheckStatus.FAIL, batch)
                .forEach(envelopeVerifier::verify);
        documentRepository
                .findByManifestCheckAndIpfsCheckAndIpfsRetryExhaustedFalse(
                        CheckStatus.PASS, CheckStatus.PENDING, batch)
                .forEach(envelopeVerifier::verify);
    }
}
