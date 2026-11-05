package org.cardanofoundation.reeve.indexer.controller;

import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.cardanofoundation.reeve.indexer.service.card.attestation.CardCeremonyExpiredException;
import org.cardanofoundation.reeve.indexer.service.card.attestation.CardCeremonyInvalidStateException;
import org.cardanofoundation.reeve.indexer.service.card.attestation.CardCeremonyNotFoundException;
import org.cardanofoundation.reeve.indexer.service.keri.KeriAgentUnavailableException;
import org.cardanofoundation.reeve.indexer.service.keri.KeriOobiValidationException;

/**
 * Exception -&gt; HTTP mapping for {@link CardAttestationController}. Scoped to that one controller
 * ({@code assignableTypes}) rather than a global advice, so it can never change behavior for
 * {@link CardController}'s own inline try/catch-based error handling ({@code
 * CardIssuanceService.CardIssuanceException}). This app has no {@code vavr}/{@code Either}
 * plumbing threaded through service calls (see {@code CardCeremonyService}'s own javadoc), so a
 * {@code @RestControllerAdvice} handles the exception-to-response mapping instead.
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
 * </ul>
 *
 * <p>There is no longer a Cardano/Blockfrost failure mapping here: the card ceremony publishes
 * nothing on-chain (see {@code CardAttestService}'s javadoc), so the tx-submission exception that
 * used to map to 502 no longer exists.
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

    private static ResponseEntity<ProblemDetail> problem(HttpStatus status, String title, Exception e) {
        log.warn("{} -> {} {}: {}", e.getClass().getSimpleName(), status.value(), title, e.getMessage());
        ProblemDetail problem = ProblemDetail.forStatus(status);
        problem.setTitle(title);
        problem.setDetail(e.getMessage());
        return ResponseEntity.status(status).body(problem);
    }
}
