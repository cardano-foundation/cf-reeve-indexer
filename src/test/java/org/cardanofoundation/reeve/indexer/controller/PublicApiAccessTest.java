package org.cardanofoundation.reeve.indexer.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.service.OrganisationService;
import org.cardanofoundation.reeve.indexer.service.ReportService;
import org.cardanofoundation.reeve.indexer.service.card.issuance.CardIssuanceService;

/**
 * The indexer's API is public: an anonymous browser request, with no credentials and no CSRF token,
 * must reach every controller, including the POST search endpoints and the card endpoints.
 *
 * <p>This runs the real servlet filter chain, which {@code standaloneSetup} (as in {@code
 * DocumentControllerValidationTest}) bypasses. The nested configuration stands in for {@code
 * ReeveIndexingExampleApplication}, whose JPA annotations would break a web slice. It imports the
 * two controllers under test and scans the {@code config} package for {@code WebConfig} (the CORS
 * mapping) and for any class whose name contains "Security". That second pattern is deliberate: if
 * a security configuration is ever added back to {@code config}, it is loaded here and these
 * assertions show whether it still lets anonymous requests through.
 *
 * <p>The status assertion comes first in every case, so a rejected request fails on the status
 * code (403 for a missing CSRF token, 401 for missing credentials), not on a later check.
 */
@WebMvcTest
class PublicApiAccessTest {

    @Configuration
    @Import({ReportController.class, CardController.class})
    @ComponentScan(basePackages = "org.cardanofoundation.reeve.indexer.config",
            useDefaultFilters = false,
            includeFilters = @ComponentScan.Filter(type = FilterType.REGEX, pattern = {
                    ".*\\.config\\.WebConfig",
                    ".*\\.config\\.[^.]*Security[^.]*"}))
    static class WebSlice {
    }

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReportService reportService;

    @MockBean
    private OrganisationService organisationService;

    @MockBean
    private CardIssuanceService cardIssuanceService;

    @Test
    void anonymousPostWithoutCsrfTokenReachesReportSearch() throws Exception {
        mockMvc.perform(post("/api/v1/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());

        verify(reportService).findAllByTypeAndPeriod(isNull(), isNull(), isNull(), isNull(),
                isNull(), isNull(), isNull(), any());
    }

    @Test
    void anonymousCardIssueReachesController() throws Exception {
        mockMvc.perform(post("/api/v1/cards/issue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());

        verify(cardIssuanceService).issue(any());
    }

    @Test
    void anonymousRegistryReadReachesController() throws Exception {
        when(cardIssuanceService.registry(any(), any(), anyInt(), anyInt())).thenReturn(Page.empty());

        mockMvc.perform(get("/api/v1/cards"))
                .andExpect(status().isOk());

        verify(cardIssuanceService).registry(isNull(), isNull(), eq(0), eq(20));
    }

    @Test
    void anonymousCardExportReachesController() throws Exception {
        mockMvc.perform(get("/api/v1/cards/{cardId}/export", UUID.randomUUID()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("CARD_NOT_FOUND"));
    }

    @Test
    void corsPreflightFromAnotherOriginIsAllowed() throws Exception {
        mockMvc.perform(options("/api/v1/reports")
                        .header(HttpHeaders.ORIGIN, "https://indexer-frontend.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*"));
    }
}
