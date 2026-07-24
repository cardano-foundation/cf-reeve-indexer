package org.cardanofoundation.reeve.indexer.controller;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.cardanofoundation.reeve.indexer.service.CardCeremonyExpiredException;
import org.cardanofoundation.reeve.indexer.service.CardCeremonyInvalidStateException;
import org.cardanofoundation.reeve.indexer.service.CardCeremonyNotFoundException;
import org.cardanofoundation.reeve.indexer.service.CardTxSubmissionException;
import org.cardanofoundation.reeve.indexer.service.KeriAgentUnavailableException;
import org.cardanofoundation.reeve.indexer.service.KeriOobiValidationException;

/**
 * Exception -&gt; HTTP mapping for {@link CardAttestationController} (design doc Part A / A6). Scoped
 * to that one controller ({@code assignableTypes}) rather than a global advice, so it can never
 * change behavior for {@link CardController}'s own inline try/catch-based error handling ({@code
 * CardIssuanceService.CardIssuanceException}) - a deliberate departure from the platform's ({@code
 * cf-reeve-platform}) {@code keri_attestation} module, which threads {@code Either<ProblemDetail, T>}
 * through every service call instead; that {@code vavr} plumbing does not exist in this app (see
 * {@code CardCeremonyService}'s own javadoc), so a {@code @RestControllerAdvice} is this module's
 * equivalent of that module's {@code Responses.respond}.
 *
 * <p>Maps ONLY the caller-side usage problems the ceremony services document as thrown - never a
 * step-level ceremony failure, which comes back as a 200 with {@code state=FAILED} instead (see
 * {@link CardAttestationController}'s own javadoc):
 * <ul>
 *   <li>{@link CardCeremonyNotFoundException} -&gt; 404 Not Found</li>
 *   <li>{@link CardCeremonyInvalidStateException} -&gt; 409 Conflict (wrong step for this ceremony)</li>
 *   <li>{@link CardCeremonyExpiredException} -&gt; 410 Gone (distinct from 409: "too late, start a new
 *       ceremony" vs. "wrong step on this one")</li>
 *   <li>{@link KeriOobiValidationException} -&gt; 422 Unprocessable Entity</li>
 *   <li>{@link KeriAgentUnavailableException} -&gt; 503 Service Unavailable</li>
 *   <li>{@link CardTxSubmissionException} -&gt; 502 Bad Gateway (a downstream Cardano/Blockfrost
 *       failure, not a KERI/wallet one - distinct from the 503 above). Defense-in-depth: {@link
 *       org.cardanofoundation.reeve.indexer.service.CardAttestService} actually catches this
 *       internally today and reports it via the ceremony's own state (staying at {@code
 *       CREDENTIAL_RECEIVED} so a retry resumes just the submission) rather than letting it reach this
 *       handler, but the mapping is kept in case that ever changes or another caller reuses the
 *       exception.</li>
 * </ul>
 */
@RestControllerAdvice(assignableTypes = CardAttestationController.class)
@Slf4j
class CardAttestationExceptionHandler {

    @ExceptionHandler(CardCeremonyNotFoundException.class)
    ResponseEntity<ProblemDetail> handleNotFound(CardCeremonyNotFoundException e) {
        return problem(HttpStatus.NOT_FOUND, "CEREMONY_NOT_FOUND", e);
    }

    @ExceptionHandler(CardCeremonyInvalidStateException.class)
    ResponseEntity<ProblemDetail> handleInvalidState(CardCeremonyInvalidStateException e) {
        return problem(HttpStatus.CONFLICT, "CEREMONY_INVALID_STATE", e);
    }

    @ExceptionHandler(CardCeremonyExpiredException.class)
    ResponseEntity<ProblemDetail> handleExpired(CardCeremonyExpiredException e) {
        return problem(HttpStatus.GONE, "CEREMONY_EXPIRED", e);
    }

    @ExceptionHandler(KeriOobiValidationException.class)
    ResponseEntity<ProblemDetail> handleOobiInvalid(KeriOobiValidationException e) {
        return problem(HttpStatus.UNPROCESSABLE_ENTITY, "OOBI_INVALID", e);
    }

    @ExceptionHandler(KeriAgentUnavailableException.class)
    ResponseEntity<ProblemDetail> handleAgentUnavailable(KeriAgentUnavailableException e) {
        return problem(HttpStatus.SERVICE_UNAVAILABLE, "KERI_AGENT_UNAVAILABLE", e);
    }

    @ExceptionHandler(CardTxSubmissionException.class)
    ResponseEntity<ProblemDetail> handleTxSubmission(CardTxSubmissionException e) {
        return problem(HttpStatus.BAD_GATEWAY, "ATTEST_TX_SUBMISSION_FAILED", e);
    }

    private static ResponseEntity<ProblemDetail> problem(HttpStatus status, String title, Exception e) {
        log.warn("{} -> {} {}: {}", e.getClass().getSimpleName(), status.value(), title, e.getMessage());
        ProblemDetail problem = ProblemDetail.forStatus(status);
        problem.setTitle(title);
        problem.setDetail(e.getMessage());
        return ResponseEntity.status(status).body(problem);
    }
}
