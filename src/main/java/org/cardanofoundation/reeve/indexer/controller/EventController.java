package org.cardanofoundation.reeve.indexer.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.request.EventSearchRequest;
import org.cardanofoundation.reeve.indexer.model.view.EventProjectView;
import org.cardanofoundation.reeve.indexer.model.view.EventResponseView;
import org.cardanofoundation.reeve.indexer.model.view.EventView;
import org.cardanofoundation.reeve.indexer.model.view.audit.AuditSummaryView;
import org.cardanofoundation.reeve.indexer.service.EventService;
import org.cardanofoundation.reeve.indexer.service.OrganisationService;

/**
 * Public read interface for {@code FUNDING} events. The primary search endpoint is scoped by
 * organisation and supports filtering (type, category, project, funding, date range, amount range)
 * plus pagination and sorting via the standard {@code Pageable} query parameters.
 */
@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Slf4j
public class EventController {

    private final EventService eventService;
    private final OrganisationService organisationService;

    @Tag(name = "Public", description = "Event bundle search")
    @PostMapping(produces = "application/json", consumes = "application/json")
    @Operation(description = "Search FUNDING events - Public interface", responses = {
            @ApiResponse(content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = EventResponseView.class))})})
    public ResponseEntity<EventResponseView> eventSearchPublicInterface(
            @Valid @RequestBody EventSearchRequest request, Pageable pageable) {
        if (request.getOrganisationId() != null) {
            Optional<OrganisationEntity> orgO =
                    organisationService.findById(request.getOrganisationId());
            if (orgO.isEmpty()) {
                ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
                        "Unable to find Organisation by Id: %s"
                                .formatted(request.getOrganisationId()));
                problemDetail.setTitle("ORGANISATION_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(EventResponseView.createFail(problemDetail));
            }
        }

        Page<EventView> page = eventService.search(request, pageable);
        return ResponseEntity.ok().body(EventResponseView.createSuccess(page.getContent(),
                page.getTotalElements(), pageable.getPageNumber(), pageable.getPageSize()));
    }

    @Tag(name = "Public", description = "Event bundle by transaction")
    @GetMapping(value = "/by-tx/{txHash}", produces = "application/json")
    @Operation(description = "Get all FUNDING events anchored in a single transaction")
    public ResponseEntity<EventResponseView> getEventsByTxHash(@PathVariable String txHash) {
        List<EventView> events = eventService.findByTxHash(txHash);
        return ResponseEntity.ok()
                .body(EventResponseView.createSuccess(events, events.size(), 0, events.size()));
    }

    @Tag(name = "Public", description = "Distinct event types of an organisation")
    @GetMapping(value = "/types/{organisationId}", produces = "application/json")
    @Operation(description = "List the distinct event types published by an organisation", responses = {
            @ApiResponse(content = {
                    @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = String.class)))})})
    public ResponseEntity<List<String>> getEventTypes(@PathVariable String organisationId) {
        return ResponseEntity.ok().body(eventService.findDistinctEventTypes(organisationId));
    }

    @Tag(name = "Public", description = "Auditor roll-up of an organisation's funding events")
    @GetMapping(value = "/audit/{organisationId}", produces = "application/json")
    @Operation(description = "Aggregated funding/spending/refund roll-up for auditors: headline "
            + "totals, per-project allocated-vs-spent breakdown and a spending ledger. Optional "
            + "dateFrom/dateTo (ISO yyyy-MM-dd) filter dated spending events.", responses = {
            @ApiResponse(content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = AuditSummaryView.class))})})
    public ResponseEntity<AuditSummaryView> getAuditSummary(
            @PathVariable String organisationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        Optional<OrganisationEntity> orgO = organisationService.findById(organisationId);
        if (orgO.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        AuditSummaryView summary = eventService.auditSummary(organisationId, orgO.get().getName(),
                dateFrom, dateTo);
        return ResponseEntity.ok().body(summary);
    }

    @Tag(name = "Public", description = "Distinct projects of an organisation")
    @GetMapping(value = "/projects/{organisationId}", produces = "application/json")
    @Operation(description = "List the distinct projects referenced by an organisation's events", responses = {
            @ApiResponse(content = {
                    @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = EventProjectView.class)))})})
    public ResponseEntity<List<EventProjectView>> getEventProjects(
            @PathVariable String organisationId) {
        return ResponseEntity.ok().body(eventService.findDistinctProjects(organisationId));
    }
}
