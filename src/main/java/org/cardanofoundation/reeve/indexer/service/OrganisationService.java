package org.cardanofoundation.reeve.indexer.service;

import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import org.cardanofoundation.reeve.indexer.model.domain.Organisation;
import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CurrencyRepository;
import org.cardanofoundation.reeve.indexer.model.repository.OrganisationRepository;
import org.cardanofoundation.reeve.indexer.model.repository.TransactionRepository;
import org.cardanofoundation.reeve.indexer.model.view.CurrencyView;
import org.cardanofoundation.reeve.indexer.model.view.EventCodeView;

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

    public List<CurrencyView> getCurrenciesForOrganisation(String orgId) {
        return currencyRepository.findAllByOrgId(orgId).stream()
                .map(currencyEntity -> new CurrencyView(currencyEntity.getId().getCurrencyId(), currencyEntity.getCustCode()))
                .toList();
    }

    public List<String> getDistinctInternalNumbersForOrganisation(String orgId) {
        return transactionRepository.findDistinctInternalNumbersByOrganisationId(orgId);
    }

    public List<String> getDistinctTransactionTypesForOrganisation(String orgId) {
        return transactionRepository.findDistinctTransactionTypesByOrganisationId(orgId);
    }

    public List<String> getDistinctDocumentNumbersForOrganisation(String orgId) {
        return transactionRepository.findDistinctDocumentNumbersByOrganisationId(orgId);
    }

    public List<String> getDistinctVatCustCodesForOrganisation(String orgId) {
        return transactionRepository.findDistinctVatCustCodesByOrganisationId(orgId);
    }

    public List<String> getDistinctCostCenterCustCodesForOrganisation(String orgId) {
        return transactionRepository.findDistinctCostCenterCustCodesByOrganisationId(orgId);
    }

    public List<String> getDistinctCounterPartyAccountNamesForOrganisation(String orgId) {
        return transactionRepository.findDistinctCounterPartyAccountNamesByOrganisationId(orgId);
    }

    public List<String> getDistinctCounterPartyCustCodesForOrganisation(String orgId) {
        return transactionRepository.findDistinctCounterPartyCustCodesByOrganisationId(orgId);
    }

    public List<EventCodeView> getDistinctEventCodeNamePairsForOrganisation(String orgId) {
        return transactionRepository.findDistinctEventCodeNamePairsByOrganisationId(orgId);
    }
}
