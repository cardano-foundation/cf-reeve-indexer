package org.cardanofoundation.reeve.indexer.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.util.List;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.model.repository.CredentialRepository;
import org.cardanofoundation.reeve.indexer.model.repository.ReportRepository;

class ReportServiceTest {

    private ReportRepository reportRepository;
    private ReportService reportService;

    @BeforeEach
    void setUp() {
        reportRepository = mock(ReportRepository.class);
        reportService = new ReportService(reportRepository, mock(OrganisationService.class),
                new ObjectMapper(), Clock.systemUTC(), mock(CredentialRepository.class),
                mock(CredentialSchemaRegistry.class));
        when(reportRepository.findFirstByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriod(
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of()));
    }

    @Test
    void periodsAreMatchedAsPairsWhenAllThreeListsAreGiven() {
        reportService.findAllByTypeAndPeriod("org-1", null, null, null,
                List.of("MONTH", "YEAR"), List.of(2024, 2023), List.of(3, 1), null, null, PageRequest.of(0, 10));

        verify(reportRepository).findFirstByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriod(
                eq("org-1"), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
                eq(List.of("MONTH-2024-3", "YEAR-2023-1")), isNull(), isNull(), any());
    }

    @Test
    void periodListsStayIndependentWhenNotAllThreeAreGiven() {
        reportService.findAllByTypeAndPeriod("org-1", null, null, null,
                null, List.of(2024), null, null, null, PageRequest.of(0, 10));

        verify(reportRepository).findFirstByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriod(
                eq("org-1"), isNull(), isNull(), isNull(), isNull(), eq(List.of(2024)), isNull(),
                isNull(), isNull(), isNull(), any());
    }

    @Test
    void emptyAccountingRegimeFilterIsNotApplied() {
        reportService.findAllByTypeAndPeriod("org-1", null, null, null,
                null, null, null, List.of(), false, PageRequest.of(0, 10));

        verify(reportRepository).findFirstByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriod(
                eq("org-1"), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), isNull(), any());
    }

    @Test
    void accountingRegimeFilterIsPassedWhenSet() {
        reportService.findAllByTypeAndPeriod("org-1", null, null, null,
                null, null, null, List.of("IFRS"), true, PageRequest.of(0, 10));

        verify(reportRepository).findFirstByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriod(
                eq("org-1"), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(),
                isNull(), eq(List.of("IFRS")), eq(true), any());
    }
}
