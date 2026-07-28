package org.cardanofoundation.reeve.indexer.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.view.document.DocumentListResponse;
import org.cardanofoundation.reeve.indexer.service.DocumentService;

/**
 * The recipientKeyHash parameter is validated through the real MVC handler adapter, not by calling the
 * controller directly: {@code @Pattern} on a {@code @RequestParam} only takes effect when the request
 * goes through Spring's argument resolution, so a plain unit test (as in {@code EventControllerTest})
 * would assert nothing about it. Standalone setup is used rather than {@code @WebMvcTest} because the
 * slice pulls in the JPA context this assertion has no need of.
 *
 * <p>The pattern is deliberately lowercase-only. On-chain hashes are lowercase hex, so quietly
 * accepting an uppercase value would return an empty page — indistinguishable from "you have no
 * documents" — instead of telling the caller their input is wrong.
 */
class DocumentControllerValidationTest {

    private static final String VALID_HASH =
            "300c9c9603b92a4b39ed3958bf9240114804db4fd373012c0ca47432d63425ae";

    private DocumentService documentService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        documentService = mock(DocumentService.class);
        when(documentService.list(any(), any(), any(), anyInt(), anyInt(), any()))
                .thenReturn(new DocumentListResponse(List.of(), 0, 0, 0, 20));
        mockMvc = MockMvcBuilders.standaloneSetup(new DocumentController(documentService)).build();
    }

    @Test
    void acceptsAWellFormedRecipientKeyHashAndPassesItThrough() throws Exception {
        mockMvc.perform(get("/api/v1/documents").param("recipientKeyHash", VALID_HASH))
                .andExpect(status().isOk());

        verify(documentService).list(isNull(), isNull(), eq(VALID_HASH), eq(0), eq(20), eq("slot,desc"));
    }

    @Test
    void rejectsAMalformedRecipientKeyHash() throws Exception {
        mockMvc.perform(get("/api/v1/documents").param("recipientKeyHash", "nope"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsAnUppercaseRecipientKeyHash() throws Exception {
        mockMvc.perform(get("/api/v1/documents").param("recipientKeyHash", VALID_HASH.toUpperCase()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void omittingTheParameterLeavesTheFilterUnset() throws Exception {
        mockMvc.perform(get("/api/v1/documents")).andExpect(status().isOk());

        verify(documentService).list(isNull(), isNull(), isNull(), eq(0), eq(20), eq("slot,desc"));
    }
}
