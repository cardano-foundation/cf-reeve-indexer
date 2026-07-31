package org.cardanofoundation.reeve.indexer.util;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;

public class ReeveMetadataDeserializerTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        SimpleModule module = new SimpleModule();
        module.addDeserializer(ReeveMetadata.class, new ReeveMetadataDeserializer());
        objectMapper.registerModule(module);
    }

    @Test
    void testUnknownTransactionTypeThrowsJsonProcessingException() {
        String jsonWithUnknownType = """
                {
                  "type": "UNKNOWN_TYPE",
                  "ver": 1,
                  "year": 2024,
                  "data": "test data"
                }
                """;

        JsonProcessingException exception = assertThrows(
                JsonProcessingException.class,
                () -> objectMapper.readValue(jsonWithUnknownType, ReeveMetadata.class));

        assertTrue(exception.getMessage().contains("Unknown transaction type: UNKNOWN_TYPE"));
    }

    @Test
    void testValidTransactionTypeDeserializesSuccessfully() throws Exception {
        String jsonWithValidType = """
                {
                  "type": "INDIVIDUAL_TRANSACTIONS",
                  "ver": 1,
                  "year": 2024
                }
                """;

        ReeveMetadata metadata = objectMapper.readValue(jsonWithValidType, ReeveMetadata.class);

        assertTrue(metadata != null);
    }

    @Test
    void testReportTypeDeserializesSuccessfully() throws Exception {
        String jsonWithReportType = """
                {
                  "type": "REPORT",
                  "ver": 2,
                  "year": 2024,
                  "data": "test report data"
                }
                """;

        ReeveMetadata metadata = objectMapper.readValue(jsonWithReportType, ReeveMetadata.class);

        assertTrue(metadata != null);
    }

    @Test
    void testReportV2TypeDeserializesSuccessfully() throws Exception {
        String jsonWithReportV2Type = """
                {
                  "type": "REPORT_V2",
                  "ver": 3,
                  "year": 2024
                }
                """;

        ReeveMetadata metadata = objectMapper.readValue(jsonWithReportV2Type, ReeveMetadata.class);

        assertTrue(metadata != null);
    }

    @Test
    void documentTypeKeepsRawDataNode() throws Exception {
        String json = """
            {"type":"DOCUMENT","org":{"id":"aabb"},
             "metadata":{"version":"1.0"},
             "data":{"id":"doc-1","ipfs_cid":"bafy123","content_hash":"%s",
                     "plaintext_hash":"%s","envelope_version":1,"slot_count":2}}
            """.formatted("a".repeat(64), "b".repeat(64));
        ReeveMetadata metadata = new ObjectMapper().readValue(json, ReeveMetadata.class);
        assertEquals(ReeveTransactionType.DOCUMENT, metadata.getType());
        assertInstanceOf(JsonNode.class, metadata.getData());
        JsonNode data = (JsonNode) metadata.getData();
        assertEquals("doc-1", data.get("id").asText());
        assertEquals(2, data.get("slot_count").asInt());
    }

    @Test
    void documentTypeWithGarbageDataStillDeserialises() throws Exception {
        String json = "{\"type\":\"DOCUMENT\",\"data\":\"not-an-object\"}";
        ReeveMetadata metadata = new ObjectMapper().readValue(json, ReeveMetadata.class);
        assertEquals(ReeveTransactionType.DOCUMENT, metadata.getType());
        assertNotNull(metadata.getData()); // raw node preserved for the processor to judge
    }

    @Test
    void documentTypeWithMissingDataDeserialises() throws Exception {
        String json = "{\"type\":\"DOCUMENT\",\"org\":{\"id\":\"aabb\"}}";
        ReeveMetadata metadata = new ObjectMapper().readValue(json, ReeveMetadata.class);
        assertEquals(ReeveTransactionType.DOCUMENT, metadata.getType());
        assertNull(metadata.getData());
    }
}
