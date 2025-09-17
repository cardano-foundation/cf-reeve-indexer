package org.cardanofoundation.reeve.indexer.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.cardanofoundation.reeve.indexer.model.domain.Organisation;
import org.cardanofoundation.reeve.indexer.model.view.CurrencyView;
import org.cardanofoundation.reeve.indexer.service.OrganisationService;


@RestController
@CrossOrigin(origins = "http://localhost:5173")
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
    public ResponseEntity<List<CurrencyView>> getCurrencies(@PathVariable("orgId") String orgId) {
        List<CurrencyView> currencies = organisationService.getCurrenciesForOrganisation(orgId);
        return ResponseEntity.ok(currencies);
    }
    
}
