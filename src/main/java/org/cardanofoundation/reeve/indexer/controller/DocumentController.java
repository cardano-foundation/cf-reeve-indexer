package org.cardanofoundation.reeve.indexer.controller;

import java.util.Optional;

import jakarta.validation.constraints.Pattern;

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
 *
 * <p><b>Do NOT add {@code @Validated} to this class.</b> It looks like it would enable the
 * {@code @Pattern} on {@code recipientKeyHash}, and it does the opposite: its presence makes Spring
 * defer to the older AOP-proxy validation path and skip the built-in method validation that actually
 * runs here, so every malformed value would sail through as 200 instead of 400. Verified both ways in
 * {@code DocumentControllerValidationTest}.
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
            // sha256 of a recipient's X25519 public key, lowercase hex (see cf-reeve-platform
            // docs/onChainFormat.md "Recipient key hashes"). Lowercase-only on purpose: the on-chain
            // values are lowercase, so silently accepting uppercase would return an empty page rather
            // than telling the caller their input is wrong.
            //
            // Unauthenticated like the rest of this controller, and necessarily so - a hash is public
            // data, and the external recipients this serves have no Reeve account to authenticate with.
            @RequestParam(required = false) @Pattern(regexp = "^[0-9a-f]{64}$",
                    message = "recipientKeyHash must be 64 lowercase hexadecimal characters")
            String recipientKeyHash,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "slot,desc") String sort) {
        return ResponseEntity.ok(documentService.list(orgId, verdict, recipientKeyHash, page, size, sort));
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
