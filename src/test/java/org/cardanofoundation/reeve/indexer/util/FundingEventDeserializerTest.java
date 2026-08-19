package org.cardanofoundation.reeve.indexer.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.event.EventCategory;
import org.cardanofoundation.reeve.indexer.model.domain.event.EventInterval;
import org.cardanofoundation.reeve.indexer.model.domain.event.FundingEvent;
import org.cardanofoundation.reeve.indexer.model.domain.event.IpfsEventManifest;
import org.cardanofoundation.reeve.indexer.model.domain.event.ProjectAllocation;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;

class FundingEventDeserializerTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Mirror the production ObjectMapper configuration: snake_case + java.time support.
        objectMapper = new ObjectMapper();
        objectMapper.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
        objectMapper.registerModule(new JavaTimeModule());
        SimpleModule module = new SimpleModule();
        module.addDeserializer(ReeveMetadata.class, new ReeveMetadataDeserializer());
        objectMapper.registerModule(module);
    }

    @Test
    void inlineSpendingBundleDeserializes() throws Exception {
        String json = """
                {
                  "org": { "id": "org1", "name": "Cardano Foundation", "currency_id": "ISO_4217:CHF",
                           "country_code": "CH", "tax_id_number": "CHE-184477354" },
                  "metadata": { "creation_slot": 12345, "timestamp": "2025-06-01T10:15:30Z", "version": "1.0" },
                  "type": "FUNDING",
                  "data": [
                    {
                      "id": "event1", "type": "SPENDING", "funding_tx": "ftx1", "funding_id": "fund1",
                      "amount_rcy": "85", "amount_fcy": "100", "vendor": "Vendor AB",
                      "spending_category": "Personnel", "fx_rate": "0.85", "hash": "doc-hash-1",
                      "notes": "Invoice #1", "date": "2025-04-03",
                      "currency_rcy": { "id": "ISO_4217:EUR", "cust_code": "EUR" },
                      "allocation": [
                        { "project_id": "ProjectID1", "project_title": "ProjectTitle",
                          "sub_project": {
                            "sub_project_id": "SubProjectID1", "sub_project_title": "SubProjectTitle",
                            "milestones": [ { "milestone_id": "ms1", "milestone_title": "Milestone AB", "allocated_amount": "85" } ]
                          } }
                      ]
                    }
                  ]
                }
                """;

        ReeveMetadata metadata = objectMapper.readValue(json, ReeveMetadata.class);

        assertEquals(ReeveTransactionType.FUNDING, metadata.getType());
        assertEquals("1.0", metadata.getMetadata().getVersion());
        assertEquals(12345L, metadata.getMetadata().getCreationSlot());
        assertEquals("org1", metadata.getOrg().getId());

        assertInstanceOf(List.class, metadata.getData());
        @SuppressWarnings("unchecked")
        List<FundingEvent> events = (List<FundingEvent>) metadata.getData();
        assertEquals(1, events.size());

        FundingEvent event = events.get(0);
        assertEquals("event1", event.getId());
        assertEquals("SPENDING", event.getType());
        assertEquals(EventCategory.GRANT, event.getCategory());
        assertEquals("ftx1", event.getFundingTx());
        assertEquals("fund1", event.getFundingId());
        assertEquals(new BigDecimal("85"), event.getAmountRcy());
        assertEquals(new BigDecimal("100"), event.getAmountFcy());
        assertEquals("Vendor AB", event.getVendor());
        assertEquals("Personnel", event.getSpendingCategory());
        assertEquals("EUR", event.getCurrency().getCustCode());
        assertEquals(LocalDate.of(2025, 4, 3), event.getDate());
        assertEquals(1, event.getAllocations().size());
        ProjectAllocation allocation = event.getAllocations().get(0);
        assertEquals("ProjectID1", allocation.getProjectId());
        assertEquals("SubProjectID1", allocation.getSubProjectId());
        assertEquals("SubProjectTitle", allocation.getSubProjectTitle());
        assertEquals(new BigDecimal("85"),
                allocation.getEffectiveMilestones().get(0).getAllocatedAmount());
        // Derived helpers
        assertEquals(new BigDecimal("85"), event.getTotalAmount());
        assertEquals(LocalDate.of(2025, 4, 3), event.getResolvedDate());
        assertTrue(event.getCustom().isEmpty());
    }

    @Test
    void inlineFundingBundleDeserializes() throws Exception {
        String json = """
                {
                  "org": { "id": "org1", "name": "CF", "currency_id": "ISO_4217:CHF",
                           "country_code": "CH", "tax_id_number": "CHE-1" },
                  "metadata": { "creation_slot": 1, "timestamp": "2025-06-01T10:15:30Z", "version": "1.0" },
                  "type": "FUNDING",
                  "data": [
                    {
                      "id": "event2", "type": "FUNDING", "funding_tx": "ftx1", "funding_id": "fund1",
                      "funding_entity": "FundingEntity",
                      "allocation": [
                        { "project_id": "ProjectID1", "project_title": "ProjectTitle",
                          "milestones": [ { "milestone_id": "ms1", "milestone_title": "Milestone AB", "allocated_amount": "100" } ] }
                      ]
                    }
                  ]
                }
                """;

        ReeveMetadata metadata = objectMapper.readValue(json, ReeveMetadata.class);
        @SuppressWarnings("unchecked")
        List<FundingEvent> events = (List<FundingEvent>) metadata.getData();
        FundingEvent event = events.get(0);

        assertEquals("FUNDING", event.getType());
        assertEquals(EventCategory.GRANT, event.getCategory());
        assertEquals("FundingEntity", event.getFundingEntity());
        assertNull(event.getAmountRcy());
        assertEquals(new BigDecimal("100"),
                event.getAllocations().get(0).getEffectiveMilestones().get(0).getAllocatedAmount());
        assertEquals(new BigDecimal("100"), event.getTotalAmount());
        assertNull(event.getResolvedDate());
    }

    @Test
    void customEventCapturesFreeFormFields() throws Exception {
        String json = """
                {
                  "org": { "id": "org1", "name": "CF", "currency_id": "ISO_4217:CHF",
                           "country_code": "CH", "tax_id_number": "CHE-1" },
                  "metadata": { "creation_slot": 1, "timestamp": "2025-06-01T10:15:30Z", "version": "1.0" },
                  "type": "FUNDING",
                  "data": [
                    { "id": "c1", "type": "BOARD_MEETING", "date": "2025-03-15",
                      "location": "Zug", "attendees": 7 }
                  ]
                }
                """;

        ReeveMetadata metadata = objectMapper.readValue(json, ReeveMetadata.class);
        @SuppressWarnings("unchecked")
        List<FundingEvent> events = (List<FundingEvent>) metadata.getData();
        FundingEvent event = events.get(0);

        assertEquals("BOARD_MEETING", event.getType());
        assertEquals(EventCategory.CUSTOM, event.getCategory());
        assertEquals(LocalDate.of(2025, 3, 15), event.getDate());
        assertEquals("Zug", event.getCustom().get("location"));
        assertEquals(7, event.getCustom().get("attendees"));
    }

    @Test
    void ipfsManifestBundleDeserializes() throws Exception {
        String json = """
                {
                  "org": { "id": "org1", "name": "CF", "currency_id": "ISO_4217:CHF",
                           "country_code": "CH", "tax_id_number": "CHE-1" },
                  "metadata": { "creation_slot": 1, "timestamp": "2025-06-01T10:15:30Z", "version": "1.0" },
                  "type": "FUNDING",
                  "data": {
                    "id": "manifest1",
                    "ipfs_cid": "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
                    "interval": "MONTHLY", "date": "2025-06-01", "event_count": 42
                  }
                }
                """;

        ReeveMetadata metadata = objectMapper.readValue(json, ReeveMetadata.class);

        assertInstanceOf(IpfsEventManifest.class, metadata.getData());
        IpfsEventManifest manifest = (IpfsEventManifest) metadata.getData();
        assertNotNull(manifest.getIpfsCid());
        assertEquals(EventInterval.MONTHLY, manifest.getInterval());
        assertEquals(42, manifest.getEventCount());
        assertEquals(LocalDate.of(2025, 6, 1), manifest.getDate());
    }
}
