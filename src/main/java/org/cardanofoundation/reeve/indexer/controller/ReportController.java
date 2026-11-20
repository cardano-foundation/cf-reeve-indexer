package org.cardanofoundation.reeve.indexer.controller;

import java.util.List;
import java.util.Optional;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.request.ReportSearchRequest;
import org.cardanofoundation.reeve.indexer.model.view.ReportResponseView;
import org.cardanofoundation.reeve.indexer.model.view.ReportView;
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

                Page<ReportView> page = reportService.findAllByTypeAndPeriod(
                                reportSearchRequest.getOrganisationId(),
                                reportSearchRequest.getBlockChainHash(),
                                reportSearchRequest.getCurrency(),
                                reportSearchRequest.getReportType(),
                                reportSearchRequest.getIntervalType(),
                                reportSearchRequest.getYear(),
                                reportSearchRequest.getPeriod(),
                                reportSearchRequest.getAccountingRegime(),
                                reportSearchRequest.getAccountingRegimeNotStated(), pageable);
                return ResponseEntity.ok().body(ReportResponseView.createSuccess(page.getContent(),
                                page.getTotalElements()));
        }

        @Operation(description = "Get the report of a transaction, only if it is the latest version of a report of the organisation")
        @GetMapping(value = "/by-tx/{txHash}", produces = "application/json")
        public ResponseEntity<ReportResponseView> getReportByTxHash(@PathVariable String txHash,
                        @RequestParam String organisationId) {
                Optional<OrganisationEntity> orgO = organisationService.findById(organisationId);

                if (orgO.isEmpty()) {
                        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
                                        "Unable to find Organisation by Id: %s".formatted(organisationId));
                        problemDetail.setTitle("ORGANISATION_NOT_FOUND");
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                        .body(ReportResponseView.createFail(problemDetail));
                }

                List<ReportView> reports = reportService.findByTxHash(organisationId, txHash);
                return ResponseEntity.ok().body(ReportResponseView.createSuccess(reports, reports.size()));
        }

        @Operation(summary = "Download report as CSV", description = "Downloads the report data as a CSV file. Only available for published reports.")
        @GetMapping(value = "/download", produces = "text/csv")
        public ResponseEntity<StreamingResponseBody> downloadReports(@RequestParam(value = "organisationId", required = true)
                                                                        @Parameter(
                                                                                description = "Filter by organisation ID",
                                                                                example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94"
                                                                        ) String organisationId,
                                                                    @RequestParam(value = "txHash", required = true) String txHash) {
                if (organisationService.findById(organisationId).isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                }

                List<ReportView> reports = reportService.findByTxHash(organisationId, txHash);
                if (reports.isEmpty()) {
                        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
                }

                StreamingResponseBody result = outputstream -> reportService.downloadReportAsCsv(reports.get(0), outputstream);

                return ResponseEntity.ok()
                                .header("Content-Disposition", "attachment; filename=reports_" + organisationId + ".csv")
                                .contentType(MediaType.parseMediaType("text/csv"))
                                .body(result);
        }

}
