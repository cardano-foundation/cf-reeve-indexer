package org.cardanofoundation.reeve.indexer.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.ByteArrayOutputStream;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.request.TransactionsSearchRequest;
import org.cardanofoundation.reeve.indexer.service.OrganisationService;
import org.cardanofoundation.reeve.indexer.service.TransactionService;

class TransactionControllerTest {

    private TransactionService transactionService;
    private OrganisationService organisationService;
    private TransactionController controller;

    @BeforeEach
    void setUp() {
        transactionService = mock(TransactionService.class);
        organisationService = mock(OrganisationService.class);
        controller = new TransactionController(transactionService, organisationService);
    }

    @Test
    void downloadReturnsNotFoundForUnknownOrganisation() {
        when(organisationService.findById("missing")).thenReturn(Optional.empty());

        ResponseEntity<StreamingResponseBody> response =
                controller.downloadTransactionsCsv("missing", new TransactionsSearchRequest());

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(transactionService, never()).downloadCsvTransactions(any(), any());
    }

    @Test
    void downloadUsesTheOrganisationFromThePath() throws Exception {
        when(organisationService.findById("org1")).thenReturn(Optional.of(new OrganisationEntity()));
        TransactionsSearchRequest request = new TransactionsSearchRequest();
        request.setOrganisationId("other");

        ResponseEntity<StreamingResponseBody> response = controller.downloadTransactionsCsv("org1", request);
        response.getBody().writeTo(new ByteArrayOutputStream());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("org1", request.getOrganisationId());
        verify(transactionService).downloadCsvTransactions(eq(request), any());
    }
}
