package org.cardanofoundation.reeve.indexer.service;

import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import org.cardanofoundation.reeve.indexer.model.domain.Organisation;
import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CurrencyRepository;
import org.cardanofoundation.reeve.indexer.model.repository.OrganisationRepository;
import org.cardanofoundation.reeve.indexer.model.repository.TransactionRepository;
import org.cardanofoundation.reeve.indexer.model.view.CurrencyView;
import org.cardanofoundation.reeve.indexer.model.view.EventCodeView;
import org.cardanofoundation.reeve.indexer.model.view.ProjectView;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrganisationService {

    private final OrganisationRepository organisationRepository;
    private final CurrencyRepository currencyRepository;
    private final TransactionRepository transactionRepository;

    public Optional<OrganisationEntity> findById(String organisationId) {
        return organisationRepository.findById(organisationId);
    }

    public List<Organisation> getAllOrganisations() {
        log.info("Fetching all organisations");
        List<OrganisationEntity> organisationEntities = organisationRepository.findAll();
        return organisationEntities.stream()
                .map(this::mapToDomain)
                .toList();
    }

    private Organisation mapToDomain(OrganisationEntity entity) {
        return Organisation.builder()
                .id(entity.getId())
                .name(entity.getName())
                .countryCode(entity.getCountryCode())
                .currencyId(entity.getCurrencyId())
                .taxIdNumber(entity.getTaxIdNumber())
                .build();
    }

    /**
     * Maps external sort property names to entity/JPQL field names.
     * Handles cases where API names differ from entity field names or require alias prefixes.
     */
    private Pageable mapSortProperties(Pageable pageable, java.util.Map<String, String> propertyMap) {
        Sort mappedSort = Sort.by(pageable.getSort().stream()
                .map(order -> {
                    String property = order.getProperty();
                    String mappedProperty = propertyMap.getOrDefault(property, property);
                    return order.withProperty(mappedProperty);
                })
                .toArray(Sort.Order[]::new));
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), mappedSort);
    }

    public List<CurrencyView> getCurrenciesForOrganisation(String orgId, Pageable pageable) {
        Pageable mappedPageable = mapSortProperties(pageable, java.util.Map.of("customerCode", "custCode"));
        return currencyRepository.findAllByOrgId(orgId, mappedPageable).stream()
                .map(currencyEntity -> new CurrencyView(currencyEntity.getId().getCurrencyId(), currencyEntity.getCustCode()))
                .toList();
    }

    public List<String> getDistinctInternalNumbersForOrganisation(String orgId, Pageable pageable) {
        return transactionRepository.findDistinctInternalNumbersByOrganisationId(orgId, pageable).getContent();
    }

    public List<String> getDistinctTransactionTypesForOrganisation(String orgId, Pageable pageable) {
        return transactionRepository.findDistinctTransactionTypesByOrganisationId(orgId, pageable).getContent();
    }

    public List<String> getDistinctDocumentNumbersForOrganisation(String orgId, Pageable pageable) {
        Pageable mappedPageable = mapSortProperties(pageable, java.util.Map.of("documentNumber", "ti.documentNumber"));
        return transactionRepository.findDistinctDocumentNumbersByOrganisationId(orgId, mappedPageable).getContent();
    }

    public List<String> getDistinctVatCustCodesForOrganisation(String orgId, Pageable pageable) {
        Pageable mappedPageable = mapSortProperties(pageable, java.util.Map.of("vatCustCode", "ti.vatCustCode"));
        return transactionRepository.findDistinctVatCustCodesByOrganisationId(orgId, mappedPageable).getContent();
    }

    public List<String> getDistinctCostCenterCustCodesForOrganisation(String orgId, Pageable pageable) {
        Pageable mappedPageable = mapSortProperties(pageable, java.util.Map.of("costCenterCustCode", "ti.costCenterCustCode"));
        return transactionRepository.findDistinctCostCenterCustCodesByOrganisationId(orgId, mappedPageable).getContent();
    }

    public List<String> getDistinctCounterPartyAccountNamesForOrganisation(String orgId, Pageable pageable) {
        Pageable mappedPageable = mapSortProperties(pageable, java.util.Map.of("counterPartyCustCode", "ti.counterPartyCustCode"));
        return transactionRepository.findDistinctCounterPartyAccountNamesByOrganisationId(orgId, mappedPageable).getContent();
    }

    public List<String> getDistinctCounterPartyCustCodesForOrganisation(String orgId, Pageable pageable) {
        Pageable mappedPageable = mapSortProperties(pageable, java.util.Map.of("counterPartyCustCode", "ti.counterPartyCustCode"));
        return transactionRepository.findDistinctCounterPartyCustCodesByOrganisationId(orgId, mappedPageable).getContent();
    }

    public List<EventCodeView> getDistinctEventCodeNamePairsForOrganisation(String orgId, Pageable pageable) {
        Pageable mappedPageable = mapSortProperties(pageable, java.util.Map.of("eventCode", "ti.eventCode"));
        return transactionRepository.findDistinctEventCodeNamePairsByOrganisationId(orgId, mappedPageable).getContent();
    }

    public List<ProjectView> getDistinctProjectCodesAndNamesForOrganisation(String orgId, Pageable pageable) {
        log.info("Fetching distinct project codes and names for organisation: {}", orgId);
        Pageable mappedPageable = mapSortProperties(pageable, java.util.Map.of("projectCustCode", "ti.projectCustCode"));
        return transactionRepository.findDistinctProjectCodesAndNamesByOrganisationId(orgId, mappedPageable).getContent();
    }
}
