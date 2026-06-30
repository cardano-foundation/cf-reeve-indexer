package org.cardanofoundation.reeve.indexer.processor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.mockito.ArgumentCaptor;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.domain.Currency;
import org.cardanofoundation.reeve.indexer.model.domain.Metadata;
import org.cardanofoundation.reeve.indexer.model.domain.Organisation;
import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.event.EventBundleEvent;
import org.cardanofoundation.reeve.indexer.model.domain.event.EventItem;
import org.cardanofoundation.reeve.indexer.model.domain.event.IpfsEventManifest;
import org.cardanofoundation.reeve.indexer.model.domain.event.Milestone;
import org.cardanofoundation.reeve.indexer.model.domain.event.ProjectAllocation;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.EventEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CurrencyRepository;
import org.cardanofoundation.reeve.indexer.model.repository.EventRepository;

class EventBundleProcessorTest {

    private EventRepository eventRepository;
    private CurrencyRepository currencyRepository;
    private IpfsGatewayClient ipfsGatewayClient;
    private EventBundleProcessor processor;

    @BeforeEach
    void setUp() {
        eventRepository = mock(EventRepository.class);
        currencyRepository = mock(CurrencyRepository.class);
        ipfsGatewayClient = mock(IpfsGatewayClient.class);
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        processor = new EventBundleProcessor(eventRepository, currencyRepository, objectMapper,
                ipfsGatewayClient);
        when(eventRepository.findByTxHashOrderByEventId(any())).thenReturn(List.of());
    }

    @Test
    void supportsEventBundleType() {
        assertEquals(ReeveTransactionType.EVENT_BUNDLE, processor.supportedType());
    }

    @Test
    void mapsInlineSpendingEventToEntityGraph() {
        EventItem item = EventItem.builder()
                .amountRcy(new BigDecimal("85"))
                .amountFcy(new BigDecimal("100"))
                .vendor("Vendor AB")
                .spendingCategory("Personnel")
                .fxRate("0.85")
                .date(LocalDate.of(2025, 4, 3))
                .currency(Currency.builder().id("ISO_4217:USD").custCode("USD").build())
                .build();
        Milestone milestone = Milestone.builder()
                .milestoneId("ms1").milestoneTitle("Milestone AB").amountRcy(new BigDecimal("100"))
                .build();
        ProjectAllocation allocation = ProjectAllocation.builder()
                .projectId("ProjectID1").projectTitle("ProjectTitle").subProjectTitle("Sub")
                .milestones(List.of(milestone))
                .build();
        EventBundleEvent event = EventBundleEvent.builder()
                .id("event1").type("SPENDING").fundingTx("ftx1").fundingId("fund1")
                .allocations(List.of(allocation)).items(List.of(item))
                .build();

        processor.process(metadataWith(List.of(event)));

        EventEntity saved = captureSavedSingle();
        assertEquals("tx1", saved.getTxHash());
        assertEquals("org1", saved.getOrganisationId());
        assertEquals("event1", saved.getEventId());
        assertEquals("SPENDING", saved.getEventType());
        assertEquals("GRANT", saved.getEventCategory());
        assertEquals("fund1", saved.getFundingId());
        assertEquals("1.0", saved.getVersion());
        assertEquals(123L, saved.getCreationSlot());
        assertEquals("metahash", saved.getMetadataHash());
        assertEquals(0, new BigDecimal("85").compareTo(saved.getTotalAmount()));
        assertEquals(LocalDate.of(2025, 4, 3), saved.getDate());
        assertEquals(1, saved.getAllocations().size());
        assertEquals("ProjectID1", saved.getAllocations().get(0).getProjectId());
        assertEquals(1, saved.getAllocations().get(0).getMilestones().size());
        assertEquals(1, saved.getItems().size());
        assertEquals("USD", saved.getItems().get(0).getCurrencyCustCode());
        assertNull(saved.getCustomData());
        assertNotNull(saved.getRaw());

        verify(currencyRepository).saveIfNotExists("org1", "ISO_4217:USD", "USD");
        verify(eventRepository, never()).deleteAll(any());
    }

    @Test
    void customEventStoresCustomDataJson() {
        EventBundleEvent event = EventBundleEvent.builder()
                .id("c1").type("BOARD_MEETING").date(LocalDate.of(2025, 3, 15))
                .build();
        event.putCustom("location", "Zug");

        processor.process(metadataWith(List.of(event)));

        EventEntity saved = captureSavedSingle();
        assertEquals("CUSTOM", saved.getEventCategory());
        assertNotNull(saved.getCustomData());
        assertEquals(LocalDate.of(2025, 3, 15), saved.getDate());
    }

    @Test
    void resolvesIpfsManifestAndStoresEventsWithCid() {
        String offChainDoc = """
                { "org_id": "org1", "currency_id": "ISO_4217:CHF", "version": "1.0", "date": "2025-06-01",
                  "events": [ { "id": "e1", "type": "REFUND", "funding_id": "fund1",
                    "allocation": [ { "project_id": "P1", "project_title": "T1",
                      "milestones": [ { "milestone_id": "m1", "milestone_title": "M1", "amount_rcy": "50" } ] } ] } ] }
                """;
        when(ipfsGatewayClient.fetch(eq("cid123"))).thenReturn(Optional.of(offChainDoc));

        IpfsEventManifest manifest = IpfsEventManifest.builder().id("man1").ipfsCid("cid123").build();
        processor.process(metadataWith(manifest));

        EventEntity saved = captureSavedSingle();
        assertEquals("e1", saved.getEventId());
        assertEquals("REFUND", saved.getEventType());
        assertEquals("cid123", saved.getIpfsCid());
    }

    @Test
    void replacesExistingEventsOnReindex() {
        when(eventRepository.findByTxHashOrderByEventId("tx1"))
                .thenReturn(List.of(new EventEntity()));
        EventBundleEvent event = EventBundleEvent.builder().id("e1").type("CUSTOM").build();

        processor.process(metadataWith(List.of(event)));

        verify(eventRepository, times(1)).deleteAll(any());
        verify(eventRepository).flush();
    }

    @Test
    void nullIdGetsFallbackAndDuplicatesAreSkipped() {
        EventBundleEvent noId = EventBundleEvent.builder()
                .type("BOARD_MEETING").date(LocalDate.of(2025, 1, 1)).build();
        EventBundleEvent dupA = EventBundleEvent.builder().id("dup").type("CUSTOM").build();
        EventBundleEvent dupB = EventBundleEvent.builder().id("dup").type("CUSTOM").build();

        processor.process(metadataWith(List.of(noId, dupA, dupB)));

        List<EventEntity> saved = captureSaved();
        // fallback id for the id-less event + first "dup"; the second "dup" is skipped.
        assertEquals(2, saved.size());
        assertEquals("event-0", saved.get(0).getEventId());
        assertEquals("dup", saved.get(1).getEventId());
    }

    private ReeveMetadata metadataWith(Object data) {
        ReeveMetadata metadata = new ReeveMetadata();
        metadata.setTxHash("tx1");
        metadata.setMetadataHash("metahash");
        metadata.setType(ReeveTransactionType.EVENT_BUNDLE);
        metadata.setOrg(Organisation.builder().id("org1").name("CF").build());
        metadata.setMetadata(Metadata.builder().version("1.0").creationSlot(123L)
                .timestamp("2025-06-01T10:15:30Z").build());
        metadata.setData(data);
        return metadata;
    }

    @SuppressWarnings("unchecked")
    private List<EventEntity> captureSaved() {
        ArgumentCaptor<List<EventEntity>> captor = ArgumentCaptor.forClass(List.class);
        verify(eventRepository).saveAll(captor.capture());
        return captor.getValue();
    }

    private EventEntity captureSavedSingle() {
        List<EventEntity> saved = captureSaved();
        assertEquals(1, saved.size());
        return saved.get(0);
    }
}
