package org.cardanofoundation.reeve.indexer.controller;

import java.util.Optional;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.request.TransactionsSearchRequest;
import org.cardanofoundation.reeve.indexer.model.view.ExtractionTransactionView;
import org.cardanofoundation.reeve.indexer.service.OrganisationService;
import org.cardanofoundation.reeve.indexer.service.TransactionService;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {

        private final TransactionService transactionService;
        private final OrganisationService organisationService;

        @Tag(name = "Public", description = "Extraction search")
        @PostMapping(produces = "application/json", consumes = "application/json")
        @Operation(description = "Search transactions items published - Public interface", responses = {
                        @ApiResponse(content = {
                                        @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = ExtractionTransactionView.class))) }) })
        public ResponseEntity<ExtractionTransactionView> transactionSearchPublicInterface(
                        @Valid @RequestBody TransactionsSearchRequest transactionsRequest,
                        Pageable pageable) {
                if (transactionsRequest.getOrganisationId() != null) {
                        Optional<OrganisationEntity> orgM = organisationService
                                        .findById(transactionsRequest.getOrganisationId());

                        if (orgM.isEmpty()) {
                                ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                                                HttpStatus.NOT_FOUND,
                                                "Unable to find Organisation by Id: %s".formatted(
                                                                transactionsRequest.getOrganisationId()));
                                problemDetail.setTitle("ORGANISATION_NOT_FOUND");
                                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                                .body(ExtractionTransactionView.createFail(problemDetail));
                        }
                }

                return ResponseEntity.ok().body(transactionService.findTransactionItems(
                                transactionsRequest.getOrganisationId(),
                                transactionsRequest.getTransactionInternalNumber(),
                                transactionsRequest.getDateFrom(), transactionsRequest.getDateTo(),
                                transactionsRequest.getEvents(),
                                transactionsRequest.getCurrency(),
                                transactionsRequest.getMinAmountLcy(),
                                transactionsRequest.getMaxAmountLcy(),
                                transactionsRequest.getMinAmountFcy(),
                                transactionsRequest.getMaxAmountFcy(),
                                transactionsRequest.getTransactionHashes(),
                                transactionsRequest.getDocumentNumber(),
                                transactionsRequest.getType(),
                                transactionsRequest.getVatCustCode(),
                                transactionsRequest.getCostCenterCustCode(),
                                transactionsRequest.getProjectCustCode(),
                                transactionsRequest.getCounterPartyType(),
                                transactionsRequest.getCounterPartyCustCode(),
                                pageable));
        }

}
