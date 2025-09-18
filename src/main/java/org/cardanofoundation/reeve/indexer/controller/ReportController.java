package org.cardanofoundation.reeve.indexer.controller;

import java.util.Optional;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.request.ReportSearchRequest;
import org.cardanofoundation.reeve.indexer.model.view.ReportResponseView;
import org.cardanofoundation.reeve.indexer.service.OrganisationService;
import org.cardanofoundation.reeve.indexer.service.ReportService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

        private final ReportService reportService;
        private final OrganisationService organisationService;

        @Operation(description = "Search transactions items published", responses = {
                        @ApiResponse(content = {
                                        @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = ReportResponseView.class)))
                        })
        })
        @PostMapping(produces = "application/json")
        public ResponseEntity<ReportResponseView> reportSearchPublicInterface(
                        @Valid @RequestBody ReportSearchRequest reportSearchRequest, Pageable pageable) {
                if (reportSearchRequest.getOrganisationId() != null) {
                        Optional<OrganisationEntity> orgO = organisationService
                                        .findById(reportSearchRequest.getOrganisationId());

                        if (orgO.isEmpty()) {
                                ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
                                                "Unable to find Organisation by Id: %s"
                                                                .formatted(reportSearchRequest.getOrganisationId()));
                                problemDetail.setTitle("ORGANISATION_NOT_FOUND");
                                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                                .body(ReportResponseView.createFail(problemDetail));
                        }
                }

                return ResponseEntity.ok().body(ReportResponseView.createSuccess(reportService.findAllByTypeAndPeriod(
                                reportSearchRequest.getOrganisationId(),
                                reportSearchRequest.getReportType(),
                                reportSearchRequest.getIntervalType(),
                                reportSearchRequest.getYear(),
                                reportSearchRequest.getPeriod(), pageable)));
        }

}
