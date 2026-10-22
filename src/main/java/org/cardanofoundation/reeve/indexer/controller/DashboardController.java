package org.cardanofoundation.reeve.indexer.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.cardanofoundation.reeve.indexer.model.view.dashboard.DashboardOverviewView;
import org.cardanofoundation.reeve.indexer.service.DashboardService;
import org.cardanofoundation.reeve.indexer.service.OrganisationService;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final OrganisationService organisationService;

    @Tag(name = "Public", description = "Landing dashboard")
    @GetMapping(value = "/overview", produces = "application/json")
    @Operation(description = "Headline roll-up of indexed transactions, reports and funding events. "
            + "Optional organisationId scopes it to one organisation; otherwise it spans all of them.", responses = {
            @ApiResponse(content = {
                    @Content(mediaType = "application/json", schema = @Schema(implementation = DashboardOverviewView.class))})})
    public ResponseEntity<DashboardOverviewView> getOverview(
            @RequestParam(required = false) String organisationId) {
        if (organisationId != null && organisationService.findById(organisationId).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(dashboardService.overview(organisationId));
    }
}
