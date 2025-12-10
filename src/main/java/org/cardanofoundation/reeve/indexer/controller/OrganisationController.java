package org.cardanofoundation.reeve.indexer.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Parameter;

import org.cardanofoundation.reeve.indexer.model.domain.Organisation;
import org.cardanofoundation.reeve.indexer.model.view.CurrencyView;
import org.cardanofoundation.reeve.indexer.model.view.EventCodeView;
import org.cardanofoundation.reeve.indexer.model.view.ProjectView;
import org.cardanofoundation.reeve.indexer.service.OrganisationService;


@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/organisations")
@RequiredArgsConstructor
@Slf4j
public class OrganisationController {

    private final OrganisationService organisationService;

    // Get all organisations
    @GetMapping
    public ResponseEntity<List<Organisation>> getAllOrganisations() {
        log.info("Fetching all organisations");
        List<Organisation> organisations = organisationService.getAllOrganisations();
        return ResponseEntity.ok(organisations);
    }

    @GetMapping("/{orgId}/currencies")
    public ResponseEntity<List<CurrencyView>> getCurrencies(
            @PathVariable("orgId") @Parameter(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94") String orgId,
            @PageableDefault(size = Integer.MAX_VALUE) Pageable pageable) {
        List<CurrencyView> currencies = organisationService.getCurrenciesForOrganisation(orgId, pageable);
        return ResponseEntity.ok(currencies);
    }

    @GetMapping("/{orgId}/internalNumber")
    public ResponseEntity<List<String>> getInternalNumbers(
            @PathVariable("orgId") @Parameter(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94") String orgId,
            @PageableDefault(size = Integer.MAX_VALUE) Pageable pageable) {
        log.info("Fetching distinct internal numbers for organisation: {}", orgId);
        List<String> internalNumbers = organisationService.getDistinctInternalNumbersForOrganisation(orgId, pageable);
        return ResponseEntity.ok(internalNumbers);
    }

    @GetMapping("/{orgId}/transactionType")
    public ResponseEntity<List<String>> getTransactionTypes(
            @PathVariable("orgId") @Parameter(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94") String orgId,
            @PageableDefault(size = Integer.MAX_VALUE) Pageable pageable) {
        log.info("Fetching distinct transaction types for organisation: {}", orgId);
        List<String> transactionTypes = organisationService.getDistinctTransactionTypesForOrganisation(orgId, pageable);
        return ResponseEntity.ok(transactionTypes);
    }

    @GetMapping("/{orgId}/documentNumber")
    public ResponseEntity<List<String>> getDocumentNumbers(
            @PathVariable("orgId") @Parameter(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94") String orgId,
            @PageableDefault(size = Integer.MAX_VALUE) Pageable pageable) {
        log.info("Fetching distinct document numbers for organisation: {}", orgId);
        List<String> documentNumbers = organisationService.getDistinctDocumentNumbersForOrganisation(orgId, pageable);
        return ResponseEntity.ok(documentNumbers);
    }

    @GetMapping("/{orgId}/vatCode")
    public ResponseEntity<List<String>> getVatCodes(
            @PathVariable("orgId") @Parameter(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94") String orgId,
            @PageableDefault(size = Integer.MAX_VALUE) Pageable pageable) {
        log.info("Fetching distinct vat codes for organisation: {}", orgId);
        List<String> vatCodes = organisationService.getDistinctVatCustCodesForOrganisation(orgId, pageable);
        return ResponseEntity.ok(vatCodes);
    }

    @GetMapping("/{orgId}/costCenter")
    public ResponseEntity<List<String>> getCostCenters(
            @PathVariable("orgId") @Parameter(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94") String orgId,
            @PageableDefault(size = Integer.MAX_VALUE) Pageable pageable) {
        log.info("Fetching distinct cost center codes for organisation: {}", orgId);
        List<String> costCenters = organisationService.getDistinctCostCenterCustCodesForOrganisation(orgId, pageable);
        return ResponseEntity.ok(costCenters);
    }

    @GetMapping("/{orgId}/counterPartyType")
    public ResponseEntity<List<String>> getCounterPartyTypes(
            @PathVariable("orgId") @Parameter(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94") String orgId,
            @PageableDefault(size = Integer.MAX_VALUE) Pageable pageable) {
        log.info("Fetching distinct counter party types for organisation: {}", orgId);
        List<String> counterPartyTypes = organisationService.getDistinctCounterPartyAccountNamesForOrganisation(orgId, pageable);
        return ResponseEntity.ok(counterPartyTypes);
    }

    @GetMapping("/{orgId}/counterParty")
    public ResponseEntity<List<String>> getCounterParties(
            @PathVariable("orgId") @Parameter(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94") String orgId,
            @PageableDefault(size = Integer.MAX_VALUE) Pageable pageable) {
        log.info("Fetching distinct counter party cust codes for organisation: {}", orgId);
        List<String> counterParties = organisationService.getDistinctCounterPartyCustCodesForOrganisation(orgId, pageable);
        return ResponseEntity.ok(counterParties);
    }

    @GetMapping("/{orgId}/events")
    public ResponseEntity<List<EventCodeView>> getEventCodes(
            @PathVariable("orgId") @Parameter(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94") String orgId,
            @PageableDefault(size = Integer.MAX_VALUE) Pageable pageable) {
        log.info("Fetching distinct event codes for organisation: {}", orgId);
        List<EventCodeView> eventPairs = organisationService.getDistinctEventCodeNamePairsForOrganisation(orgId, pageable);
        return ResponseEntity.ok(eventPairs);
    }

    @GetMapping("/{orgId}/projects")
    public ResponseEntity<List<ProjectView>> getProjects(
            @PathVariable("orgId") @Parameter(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94") String orgId,
            @PageableDefault(size = Integer.MAX_VALUE) Pageable pageable) {
        log.info("Fetching distinct project codes and names for organisation: {}", orgId);
        List<ProjectView> projects = organisationService.getDistinctProjectCodesAndNamesForOrganisation(orgId, pageable);
        return ResponseEntity.ok(projects);
    }
}
