package org.cardanofoundation.reeve.indexer.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.view.ReportView;
import org.cardanofoundation.reeve.indexer.service.OrganisationService;
import org.cardanofoundation.reeve.indexer.service.ReportService;

class ReportControllerTest {

    private ReportService reportService;
    private OrganisationService organisationService;
    private ReportController controller;

    @BeforeEach
    void setUp() {
        reportService = mock(ReportService.class);
        organisationService = mock(OrganisationService.class);
        controller = new ReportController(reportService, organisationService);
    }

    @Test
    void downloadReturnsNotFoundForUnknownOrganisation() {
        when(organisationService.findById("missing")).thenReturn(Optional.empty());

        ResponseEntity<StreamingResponseBody> response = controller.downloadReports("missing", "tx-1");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(reportService, never()).downloadReportAsCsv(any(), any());
    }

    @Test
    void downloadReturnsNotFoundWhenNoReportBelongsToTheTxHash() {
        when(organisationService.findById("org1")).thenReturn(Optional.of(new OrganisationEntity()));
        when(reportService.findByTxHash("org1", "tx-old")).thenReturn(List.of());

        ResponseEntity<StreamingResponseBody> response = controller.downloadReports("org1", "tx-old");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(reportService, never()).downloadReportAsCsv(any(), any());
    }

    @Test
    void downloadStreamsTheReportOfTheTxHash() throws Exception {
        when(organisationService.findById("org1")).thenReturn(Optional.of(new OrganisationEntity()));
        ReportView report = ReportView.builder().txHash("tx-1").build();
        when(reportService.findByTxHash("org1", "tx-1")).thenReturn(List.of(report));

        ResponseEntity<StreamingResponseBody> response = controller.downloadReports("org1", "tx-1");
        response.getBody().writeTo(new ByteArrayOutputStream());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(reportService).downloadReportAsCsv(eq(report), any());
    }
}
