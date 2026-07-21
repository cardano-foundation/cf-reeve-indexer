package org.cardanofoundation.reeve.indexer.controller;

import java.util.Optional;

import lombok.RequiredArgsConstructor;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentDetailResponse;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentListResponse;
import org.cardanofoundation.reeve.indexer.service.DocumentService;

/**
 * Public read API for indexed Document Vault anchors (contract §9.6). Deliberately
 * unauthenticated: a verifier you must log into is not a verifier. Rows are hash-identified
 * only — file names, descriptions and e-mails never reach L1/IPFS (I10), so they cannot
 * appear here.
 */
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Published Document Vault anchors and their verification verdicts")
public class DocumentController {

    private final DocumentService documentService;

    @Operation(summary = "Paged index of published documents with verification verdicts")
    @GetMapping
    public ResponseEntity<DocumentListResponse> list(
            @RequestParam(required = false) String orgId,
            @RequestParam(required = false) DocumentVerdict verdict,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "slot,desc") String sort) {
        return ResponseEntity.ok(documentService.list(orgId, verdict, page, size, sort));
    }

    @Operation(summary = "Manifest + verdict detail for every anchor of a documentId")
    @GetMapping("/{documentId}")
    public ResponseEntity<?> detail(@PathVariable String documentId) {
        Optional<DocumentDetailResponse> detail = documentService.detail(documentId);
        if (detail.isEmpty()) {
            return notFound();
        }
        return ResponseEntity.ok(detail.get());
    }

    @Operation(summary = "The IPFS envelope, proxied (spares the browser a CORS fight)")
    @GetMapping(value = "/{documentId}/envelope", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> envelope(@PathVariable String documentId,
            @RequestParam(required = false) String txHash) {
        try {
            byte[] envelope = documentService.fetchEnvelope(documentId, txHash);
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(365))
                            .cachePublic().immutable())
                    .body(envelope);
        } catch (DocumentService.AmbiguousDocumentIdException e) {
            ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
            problem.setTitle("AMBIGUOUS_DOCUMENT_ID");
            problem.setDetail(e.getMessage());
            return ResponseEntity.badRequest().body(problem);
        } catch (DocumentService.AnchorNotFoundException e) {
            return notFound();
        } catch (DocumentService.EnvelopeNotOnIpfsException e) {
            ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
            problem.setTitle("ENVELOPE_NOT_RECORDED");
            problem.setDetail(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
        } catch (DocumentService.AnchorNotVerifiableException e) {
            // A malformed-manifest anchor has no verifiable envelope to serve. The detail
            // endpoint still returns the row (as MALFORMED_MANIFEST).
            ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
            problem.setTitle("ENVELOPE_NOT_AVAILABLE");
            problem.setDetail(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
        } catch (DocumentService.GatewayFailureException e) {
            ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_GATEWAY);
            problem.setTitle("ENVELOPE_UNAVAILABLE");
            problem.setDetail("The IPFS gateway did not deliver the envelope");
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(problem);
        }
    }

    private ResponseEntity<ProblemDetail> notFound() {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problem.setTitle("DOCUMENT_NOT_FOUND");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }
}
