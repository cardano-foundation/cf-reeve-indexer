package org.cardanofoundation.reeve.indexer.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CredentialRepository;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.model.response.IdentityAttestationView;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentDetailResponse;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentListResponse;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentView;
import org.cardanofoundation.reeve.indexer.processor.IpfsGatewayClient;

@Service
@RequiredArgsConstructor
public class DocumentService {

    /** Sort fields are whitelisted — everything else silently falls back (no SQL surprises). */
    private static final Set<String> SORTABLE = Set.of("slot", "blockTime", "createdAt");

    private final DocumentRepository documentRepository;
    private final IpfsGatewayClient ipfsGatewayClient;
    private final CredentialRepository credentialRepository;
    private final CredentialSchemaRegistry credentialSchemaRegistry;
    private final ObjectMapper objectMapper;

    // ACCEPTED TRADEOFF (documented): this public list uses Spring Data Page, whose getTotalElements()/
    // getTotalPages() below force an exact COUNT. With the publisher gate removed, reeve_document is
    // attacker-growable, so a broad/unfiltered listing can make the COUNT do work proportional to the
    // flood — the same unbounded-COUNT shape that was removed from detail(). This is knowingly retained
    // as part of the "remove the publisher check, re-opening forged-anchor DoS" decision; hardening it
    // (count-free Slice pagination, or a capped count) is deferred. The page size itself is capped (200).
    public DocumentListResponse list(String orgId, DocumentVerdict verdict, int page, int size,
            String sort) {
        PageRequest pageRequest = PageRequest.of(Math.max(0, page),
                Math.min(Math.max(1, size), 200), parseSort(sort));
        Page<DocumentEntity> result;
        if (orgId != null && verdict != null) {
            result = documentRepository.findByOrganisationIdAndVerdict(orgId, verdict, pageRequest);
        } else if (orgId != null) {
            result = documentRepository.findByOrganisationId(orgId, pageRequest);
        } else if (verdict != null) {
            result = documentRepository.findByVerdict(verdict, pageRequest);
        } else {
            result = documentRepository.findAll(pageRequest);
        }
        return new DocumentListResponse(result.getContent().stream()
                .map(e -> DocumentView.from(e, resolveIdentities(e))).toList(),
                result.getTotalElements(), result.getTotalPages(), result.getNumber(),
                result.getSize());
    }

    public Optional<DocumentDetailResponse> detail(String documentId) {
        List<DocumentEntity> anchors = documentRepository.findTop100ByDocumentIdOrderBySlotAsc(documentId);
        if (anchors.isEmpty()) {
            return Optional.empty();
        }
        // The capped list already answers the duplicate flag: any duplicate means >= 2 anchors were
        // loaded. This avoids an exact COUNT over a possibly attacker-flooded document_id (a COUNT
        // cannot stop at the second row); the (document_id, slot) index bounds this LIMIT-100 read.
        boolean duplicateAnchors = anchors.size() > 1;
        return Optional.of(new DocumentDetailResponse(documentId,
                anchors.stream().map(e -> DocumentView.from(e, resolveIdentities(e))).toList(),
                duplicateAnchors));
    }

    /**
     * Assembled the same way {@code ReportService} builds {@code ReportView.identities}: load the
     * verified identity's credential by identifier and project it via {@link IdentityAttestationView}.
     * Unlike reports (grouped by a shared metadataHash, so several identities may apply), a document
     * correlates 1:1 by its own identifier — at most one element.
     */
    private List<IdentityAttestationView> resolveIdentities(DocumentEntity entity) {
        if (!entity.isIdentityVerified() || entity.getIdentifier() == null) {
            return List.of();
        }
        return credentialRepository.findById(entity.getIdentifier())
                .map(cred -> IdentityAttestationView.from(entity.getIdentifier(), entity.getTxHash(),
                        cred, credentialSchemaRegistry, objectMapper))
                .map(List::of)
                .orElseGet(List::of);
    }

    /**
     * Fetches the IPFS envelope for a document anchor. Throws rather than returning an empty
     * {@code Optional} so the controller can tell apart an unknown document/txHash (404), an
     * anchor that never recorded a CID (404), and a genuine gateway failure (502) — instead of
     * collapsing all three into one ambiguous "not there" signal.
     */
    public byte[] fetchEnvelope(String documentId, String txHash) {
        DocumentEntity anchor;
        if (txHash != null) {
            // Direct (documentId, txHash) lookup — never materialise the full anchor set for one envelope.
            anchor = documentRepository.findByDocumentIdAndTxHash(documentId, txHash).stream().findFirst()
                    .orElseThrow(() -> new AnchorNotFoundException(documentId, txHash));
        } else {
            // Two rows is enough to tell a single anchor from an ambiguous document id.
            List<DocumentEntity> anchors = documentRepository.findTop2ByDocumentIdOrderBySlotAsc(documentId);
            if (anchors.isEmpty()) {
                throw new AnchorNotFoundException(documentId);
            }
            if (anchors.size() > 1) {
                throw new AmbiguousDocumentIdException(documentId);
            }
            anchor = anchors.get(0);
        }
        // Serve ONLY fully-VERIFIED anchors (all four checks PASS). This keeps the public, request-
        // driven proxy from re-fetching attacker-controlled content: a forged anchor with an
        // unresolvable CID never verifies (FAILs after the bounded retry budget), and — crucially —
        // a resolvable-but-bad anchor whose bytes fetched (ipfsCheck PASS) yet mismatched the on-chain
        // hash or is a malformed envelope also never reaches VERIFIED, so its known-bad CID is never
        // re-fetched here. This is the request-path counterpart to the scheduler's retry budget, now
        // that no publisher check gates who may anchor. Each served fetch is also MAX_ENVELOPE_BYTES-capped.
        if (anchor.getVerdict() != DocumentVerdict.VERIFIED) {
            throw new AnchorNotVerifiableException(documentId);
        }
        if (anchor.getIpfsCid() == null) {
            throw new EnvelopeNotOnIpfsException(documentId);
        }
        return ipfsGatewayClient.fetchBytes(anchor.getIpfsCid(), IpfsGatewayClient.MAX_ENVELOPE_BYTES)
                .orElseThrow(() -> new GatewayFailureException(documentId));
    }

    private Sort parseSort(String sort) {
        String field = "slot";
        Sort.Direction direction = Sort.Direction.DESC;
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            String requestedField = parts[0].trim();
            // An unwhitelisted field falls back to the default field AND direction together —
            // a caller-supplied direction paired with a rejected field must not leak through.
            if (SORTABLE.contains(requestedField)) {
                field = requestedField;
                if (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())) {
                    direction = Sort.Direction.ASC;
                }
            }
        }
        return Sort.by(direction, field);
    }

    public static class AmbiguousDocumentIdException extends RuntimeException {
        public AmbiguousDocumentIdException(String documentId) {
            super("Several anchors exist for document " + documentId + " - pass txHash");
        }
    }

    /** No anchor at all for this documentId, or none matching the given txHash. */
    public static class AnchorNotFoundException extends RuntimeException {
        public AnchorNotFoundException(String documentId) {
            super("No anchor found for document " + documentId);
        }

        public AnchorNotFoundException(String documentId, String txHash) {
            super("No anchor found for document " + documentId + " with txHash " + txHash);
        }
    }

    /** The matched anchor exists but never recorded an IPFS CID. */
    public static class EnvelopeNotOnIpfsException extends RuntimeException {
        public EnvelopeNotOnIpfsException(String documentId) {
            super("Anchor for document " + documentId + " has no IPFS CID recorded");
        }
    }

    /** The anchor has a CID, but the IPFS gateway failed to deliver its content. */
    public static class GatewayFailureException extends RuntimeException {
        public GatewayFailureException(String documentId) {
            super("IPFS gateway failed to deliver the envelope for document " + documentId);
        }
    }

    /**
     * The matched anchor is not fully VERIFIED (some check has not PASSed): its bytes have not been
     * fetched and integrity-verified end-to-end, so the request-driven proxy refuses to fetch its
     * CID. This is what bounds forged-anchor gateway I/O on the public read path.
     */
    public static class AnchorNotVerifiableException extends RuntimeException {
        public AnchorNotVerifiableException(String documentId) {
            super("Anchor for document " + documentId + " is not fully verified");
        }
    }
}
