package org.cardanofoundation.reeve.indexer.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.model.domain.Interval;
import org.cardanofoundation.reeve.indexer.model.domain.ReportType;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity;
import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CredentialRepository;
import org.cardanofoundation.reeve.indexer.model.repository.ReportRepository;
import org.cardanofoundation.reeve.indexer.model.response.IdentityAttestationView;
import org.cardanofoundation.reeve.indexer.model.view.ReportView;

class ReportServiceTest {

    private ReportRepository reportRepository;
    private OrganisationService organisationService;
    private CredentialRepository credentialRepository;
    private ReportService reportService;

    @BeforeEach
    void setUp() {
        reportRepository = mock(ReportRepository.class);
        organisationService = mock(OrganisationService.class);
        credentialRepository = mock(CredentialRepository.class);
        reportService = new ReportService(reportRepository, organisationService,
                new ObjectMapper(), Clock.systemUTC(), credentialRepository,
                mock(CredentialSchemaRegistry.class));
        when(reportRepository.findFirstByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriod(
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new PageImpl<>(List.of()));
        when(organisationService.findById("org-1"))
                .thenReturn(Optional.of(OrganisationEntity.builder().id("org-1").currencyId("ISO_4217:CHF").build()));
    }

    private ReportEntity report(String txHash, String organisationId, long ver) {
        return ReportEntity.builder()
                .txHash(txHash)
                .organisationId(organisationId)
                .type(ReportType.V1)
                .interval(Interval.MONTH)
                .year(2023)
                .period(3)
                .subType("BALANCE_SHEET")
                .ver(ver)
                .fields("{}")
                .build();
    }

    private void latestVersionIs(ReportEntity latest) {
        when(reportRepository.findFirstByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriodAndVerNotNullOrderByVerDescIdAsc(
                "org-1", "BALANCE_SHEET", Interval.MONTH, 2023, 3)).thenReturn(Optional.of(latest));
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

    @Test
    void unknownTxHashReturnsNoReport() {
        when(reportRepository.findByTxHash("tx-unknown")).thenReturn(Optional.empty());

        assertTrue(reportService.findByTxHash("org-1", "tx-unknown").isEmpty());
    }

    @Test
    void txHashOfLatestVersionReturnsTheReport() {
        ReportEntity latest = report("tx-1", "org-1", 2L);
        when(reportRepository.findByTxHash("tx-1")).thenReturn(Optional.of(latest));
        latestVersionIs(latest);

        List<ReportView> reports = reportService.findByTxHash("org-1", "tx-1");

        assertEquals(1, reports.size());
        assertEquals("tx-1", reports.get(0).getTxHash());
    }

    @Test
    void txHashOfAnotherSignatureReturnsTheListedReport() {
        when(reportRepository.findByTxHash("tx-2")).thenReturn(Optional.of(report("tx-2", "org-1", 2L)));
        latestVersionIs(report("tx-1", "org-1", 2L));

        List<ReportView> reports = reportService.findByTxHash("org-1", "tx-2");

        assertEquals(1, reports.size());
        assertEquals("tx-1", reports.get(0).getTxHash());
    }

    @Test
    void txHashOfSupersededVersionReturnsNoReport() {
        when(reportRepository.findByTxHash("tx-old")).thenReturn(Optional.of(report("tx-old", "org-1", 1L)));
        latestVersionIs(report("tx-1", "org-1", 2L));

        assertTrue(reportService.findByTxHash("org-1", "tx-old").isEmpty());
    }

    @Test
    void txHashOfAnotherOrganisationReturnsNoReport() {
        when(reportRepository.findByTxHash("tx-other")).thenReturn(Optional.of(report("tx-other", "org-2", 2L)));

        assertTrue(reportService.findByTxHash("org-1", "tx-other").isEmpty());
    }

    @Test
    void identitiesCarryTheBlockTimeOfTheirSigningTransaction() {
        ReportEntity orgSignature = report("tx-1", "org-1", 2L);
        orgSignature.setIdentityVerified(true);
        orgSignature.setIdentifier("aid-org");
        orgSignature.setBlockTime(100L);
        ReportEntity auditorSignature = report("tx-2", "org-1", 2L);
        auditorSignature.setIdentityVerified(true);
        auditorSignature.setIdentifier("aid-auditor");
        auditorSignature.setBlockTime(200L);
        when(reportRepository.findByTxHash("tx-1")).thenReturn(Optional.of(orgSignature));
        latestVersionIs(orgSignature);
        when(reportRepository.findByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriodAndVer(
                "org-1", "BALANCE_SHEET", Interval.MONTH, 2023, 3, 2L))
                .thenReturn(List.of(orgSignature, auditorSignature));
        when(credentialRepository.findById("aid-org"))
                .thenReturn(Optional.of(CredentialEntity.builder().schemaSaid("said").build()));
        when(credentialRepository.findById("aid-auditor"))
                .thenReturn(Optional.of(CredentialEntity.builder().schemaSaid("said").build()));

        List<ReportView> reports = reportService.findByTxHash("org-1", "tx-1");

        assertEquals(1, reports.size());
        List<IdentityAttestationView> identities = reports.get(0).getIdentities();
        assertEquals(2, identities.size());
        assertEquals("aid-org", identities.get(0).getAid());
        assertEquals(100L, identities.get(0).getBlockTime());
        assertEquals("aid-auditor", identities.get(1).getAid());
        assertEquals(200L, identities.get(1).getBlockTime());
    }
}
