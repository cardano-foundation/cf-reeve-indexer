package org.cardanofoundation.reeve.indexer.model.view;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.domain.Interval;
import org.cardanofoundation.reeve.indexer.model.domain.ReportType;
import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;

public class ReportViewTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private ReportEntity.ReportEntityBuilder baseReport() {
        return ReportEntity.builder()
                .organisationId("org-1")
                .type(ReportType.V1)
                .txHash("tx-1")
                .interval(Interval.YEAR)
                .year(2024)
                .period(1)
                .subType("INCOME_STATEMENT")
                .ver(1L)
                .fields("{}")
                .metadataHash("hash-1");
    }

    private OrganisationEntity org() {
        return OrganisationEntity.builder().id("org-1").currencyId("ISO_4217:CHF").build();
    }

    @Test
    void fromEntityCarriesAccountingRegimeWhenPresent() throws Exception {
        ReportEntity entity = baseReport().accountingRegime("IFRS").build();

        ReportView view = ReportView.fromEntity(entity, org(), objectMapper);

        assertEquals("IFRS", view.getAccountingRegime());
    }

    @Test
    void fromEntityLegacyReportHasNullAccountingRegimeAndUnchangedFields() throws Exception {
        // Legacy reports never had this column populated.
        ReportEntity entity = baseReport().build();

        ReportView view = ReportView.fromEntity(entity, org(), objectMapper);

        assertNull(view.getAccountingRegime());
        assertEquals("org-1", view.getOrganisationId());
        assertEquals("INCOME_STATEMENT", view.getSubType());
        assertEquals("YEAR", view.getIntervalType());
        assertEquals(2024, view.getYear());
        assertEquals(1, view.getPeriod());
        assertEquals(1L, view.getVer());
        assertEquals("tx-1", view.getTxHash());
    }

    @Test
    void nullAccountingRegimeIsSerializedExplicitlyRatherThanOmitted() throws Exception {
        ReportEntity entity = baseReport().build();
        ReportView view = ReportView.fromEntity(entity, org(), objectMapper);

        String json = objectMapper.writeValueAsString(view);

        // The key must still appear (as null) so the frontend can distinguish an absent legacy
        // value from a field that failed to load, even though other null fields are omitted.
        assertTrue(json.contains("\"accountingRegime\":null"));
    }
}
