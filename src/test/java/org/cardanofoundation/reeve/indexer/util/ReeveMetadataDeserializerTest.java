package org.cardanofoundation.reeve.indexer.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.module.SimpleModule;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;

public class ReeveMetadataDeserializerTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        // Mirrors spring.jackson.property-naming-strategy: SNAKE_CASE in application.yml, which
        // is how nested objects like "metadata" (creation_slot -> creationSlot) are actually
        // deserialized at runtime.
        objectMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
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
    void testReportTypeWithAccountingRegimeDeserializesRegimeValue() throws Exception {
        String jsonWithRegime = """
                {
                  "type": "REPORT",
                  "ver": 2,
                  "year": 2024,
                  "subType": "INCOME_STATEMENT",
                  "interval": "YEAR",
                  "accounting_regime": "IFRS",
                  "data": "test report data"
                }
                """;

        ReeveMetadata metadata = objectMapper.readValue(jsonWithRegime, ReeveMetadata.class);

        assertEquals("IFRS", metadata.getAccountingRegime());
    }

    @Test
    void testReportV2TypeWithAccountingRegimeDeserializesRegimeValue() throws Exception {
        String jsonWithRegime = """
                {
                  "type": "REPORT_V2",
                  "ver": 3,
                  "year": 2024,
                  "subType": "INCOME_STATEMENT",
                  "interval": "YEAR",
                  "accounting_regime": "US_GAAP"
                }
                """;

        ReeveMetadata metadata = objectMapper.readValue(jsonWithRegime, ReeveMetadata.class);

        assertEquals("US_GAAP", metadata.getAccountingRegime());
    }

    @Test
    void testLegacyReportWithoutAccountingRegimeDeserializesWithNullRegimeAndUnchangedFields() throws Exception {
        // Reports published before the accounting regime field existed carry no such key at all.
        String jsonWithoutRegime = """
                {
                  "type": "REPORT",
                  "ver": 2,
                  "year": 2024,
                  "period": 1,
                  "subType": "INCOME_STATEMENT",
                  "interval": "YEAR",
                  "data": "test report data"
                }
                """;

        ReeveMetadata metadata = objectMapper.readValue(jsonWithoutRegime, ReeveMetadata.class);

        assertNull(metadata.getAccountingRegime());
        assertEquals("INCOME_STATEMENT", metadata.getSubType());
        assertEquals(2024, metadata.getYear());
        assertEquals(1, metadata.getPeriod());
        assertEquals(2L, metadata.getVer());
    }

    @Test
    void testRealPreviouslyIngestedLegacyReportMetadataDeserializesWithNullRegime() throws Exception {
        // Real on-chain report metadata captured from a report published before the accounting
        // regime field existed (devkit tx ee26b164dfb98715e0e5873d0fa1d57cc7e6245ba687199a1a5a4359fc396885),
        // confirming this indexer still ingests it unchanged now that the field is optional.
        String realLegacyReportMetadata = """
                {"mode": "SYSTEM", "ver": 1, "period": 1, "metadata": {"creation_slot": 1235, "version": "1.2", "timestamp": "2026-09-02T17:30:34.826248038Z"}, "data": {"profit_for_the_year": {"_o": 7, "v": "0"}, "tax_expenses": {"_o": 6, "direct_taxes": {"_o": 1, "v": "0"}}, "financial_income": {"_o": 4, "staking_rewards_income": {"_o": 4, "v": "0"}, "net_income_options_sale": {"_o": 5, "v": "0"}, "financial_revenues": {"_o": 1, "v": "0"}, "realised_gains_on_sale_of_cryptocurrencies": {"_o": 3, "v": "0"}, "financial_expenses": {"_o": 2, "v": "0"}}, "operating_expenses": {"_o": 3, "personnel_expenses": {"_o": 1, "v": "0"}, "rent_expenses": {"_o": 5, "v": "0"}, "depreciation_and_impairment_losses_on_tangible_assets": {"_o": 3, "v": "0"}, "amortization_on_intangible_assets": {"_o": 4, "v": "0"}, "general_and_administrative_expenses": {"_o": 2, "v": "0"}}, "extraordninary_income": {"_o": 5, "extraprdinary_expenses": {"_o": 1, "v": "0"}}, "cost_of_goods_and_services": {"_o": 2, "external_services": {"_o": 1, "v": "0"}}, "revenues": {"_o": 1, "building_of_long_term_provisions": {"_o": 1, "v": "0"}}}, "org": {"country_code": "CH", "name": "Cardano Foundation", "tax_id_number": "CHE-184477354", "id": "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94", "currency_id": "ISO_4217:CHF"}, "year": "2026", "subType": "INCOME_STATEMENT", "interval": "QUARTER", "type": "REPORT"}
                """;

        ReeveMetadata metadata = objectMapper.readValue(realLegacyReportMetadata, ReeveMetadata.class);

        assertNull(metadata.getAccountingRegime());
        assertEquals("75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94", metadata.getOrg().getId());
        assertEquals("INCOME_STATEMENT", metadata.getSubType());
        assertEquals(2026, metadata.getYear());
        assertEquals(1, metadata.getPeriod());
        assertEquals(1L, metadata.getVer());
        assertEquals("QUARTER", metadata.getInterval().name());
        assertTrue(((String) metadata.getData()).contains("profit_for_the_year"));
    }
}
