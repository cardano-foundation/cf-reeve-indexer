package org.cardanofoundation.reeve.indexer.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.repository.CurrencyRepository;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.model.repository.EventRepository;
import org.cardanofoundation.reeve.indexer.model.repository.OrganisationRepository;
import org.cardanofoundation.reeve.indexer.model.repository.ReportRepository;
import org.cardanofoundation.reeve.indexer.model.repository.TransactionRepository;
import org.cardanofoundation.reeve.indexer.model.view.OrganisationLastUpdatedView;

class OrganisationServiceTest {

    private ReportRepository reportRepository;
    private TransactionRepository transactionRepository;
    private EventRepository eventRepository;
    private DocumentRepository documentRepository;
    private OrganisationService organisationService;

    @BeforeEach
    void setUp() {
        reportRepository = mock(ReportRepository.class);
        transactionRepository = mock(TransactionRepository.class);
        eventRepository = mock(EventRepository.class);
        documentRepository = mock(DocumentRepository.class);
        organisationService = new OrganisationService(mock(OrganisationRepository.class),
                mock(CurrencyRepository.class), transactionRepository, reportRepository,
                eventRepository, documentRepository);
    }

    @Test
    void lastUpdatedIsMostRecentBlockTimeAcrossAllPublishedData() {
        when(reportRepository.findLastUpdatedPerOrganisation())
                .thenReturn(List.of(new OrganisationLastUpdatedView("orgA", 100L)));
        when(transactionRepository.findLastUpdatedPerOrganisation())
                .thenReturn(List.of(new OrganisationLastUpdatedView("orgA", 300L),
                        new OrganisationLastUpdatedView("orgB", 50L)));
        when(eventRepository.findLastUpdatedPerOrganisation())
                .thenReturn(List.of(new OrganisationLastUpdatedView("orgA", 200L)));

        List<OrganisationLastUpdatedView> result = organisationService.getLastUpdatedPerOrganisation();

        Map<String, Long> byOrganisation = result.stream().collect(Collectors.toMap(
                OrganisationLastUpdatedView::getOrganisationId, OrganisationLastUpdatedView::getLastUpdated));
        assertEquals(2, result.size());
        assertEquals(300L, byOrganisation.get("orgA"));
        assertEquals(50L, byOrganisation.get("orgB"));
    }

    @Test
    void lastUpdatedIsEmptyWhenNothingIsPublished() {
        when(reportRepository.findLastUpdatedPerOrganisation()).thenReturn(List.of());
        when(transactionRepository.findLastUpdatedPerOrganisation()).thenReturn(List.of());
        when(eventRepository.findLastUpdatedPerOrganisation()).thenReturn(List.of());
        when(documentRepository.findLastUpdatedPerOrganisation()).thenReturn(List.of());

        assertTrue(organisationService.getLastUpdatedPerOrganisation().isEmpty());
    }

    @Test
    void documentsCountForTheLastUpdatedDate() {
        when(reportRepository.findLastUpdatedPerOrganisation())
                .thenReturn(List.of(new OrganisationLastUpdatedView("orgA", 100L)));
        when(documentRepository.findLastUpdatedPerOrganisation())
                .thenReturn(List.of(new OrganisationLastUpdatedView("orgA", 400L),
                        new OrganisationLastUpdatedView("orgC", 70L)));

        List<OrganisationLastUpdatedView> result = organisationService.getLastUpdatedPerOrganisation();

        Map<String, Long> byOrganisation = result.stream().collect(Collectors.toMap(
                OrganisationLastUpdatedView::getOrganisationId, OrganisationLastUpdatedView::getLastUpdated));
        assertEquals(2, result.size());
        assertEquals(400L, byOrganisation.get("orgA"));
        assertEquals(70L, byOrganisation.get("orgC"));
    }
}
