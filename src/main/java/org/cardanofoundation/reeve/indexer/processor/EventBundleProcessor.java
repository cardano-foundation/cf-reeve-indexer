package org.cardanofoundation.reeve.indexer.processor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.domain.Metadata;
import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.event.EventBundleEvent;
import org.cardanofoundation.reeve.indexer.model.domain.event.EventItem;
import org.cardanofoundation.reeve.indexer.model.domain.event.IpfsEventManifest;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.EventAllocationEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventItemEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventMilestoneEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CurrencyRepository;
import org.cardanofoundation.reeve.indexer.model.repository.EventRepository;

/**
 * Persists {@code EVENT_BUNDLE} transactions. The bundle {@code data} is either an inline array of
 * events or an IPFS manifest; in the latter case the off-chain document is resolved and its events
 * are stored exactly like inline ones (with the originating CID recorded). Processing is idempotent
 * per transaction so re-indexing/rollbacks do not create duplicates.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EventBundleProcessor implements ReeveTypeProcessor {

    private final EventRepository eventRepository;
    private final CurrencyRepository currencyRepository;
    private final ObjectMapper objectMapper;
    private final IpfsGatewayClient ipfsGatewayClient;

    @Override
    public ReeveTransactionType supportedType() {
        return ReeveTransactionType.EVENT_BUNDLE;
    }

    @Override
    public void process(ReeveMetadata metadata) {
        String txHash = metadata.getTxHash();
        String organisationId = metadata.getOrg().getId();

        List<EventBundleEvent> events = new ArrayList<>();
        String ipfsCid = null;

        Object data = metadata.getData();
        if (data instanceof List<?> inline) {
            inline.forEach(e -> events.add((EventBundleEvent) e));
        } else if (data instanceof IpfsEventManifest manifest) {
            ipfsCid = manifest.getIpfsCid();
            events.addAll(fetchManifestEvents(manifest, txHash));
        } else if (data != null) {
            log.warn("Unexpected EVENT_BUNDLE data type {} for tx {}", data.getClass(), txHash);
        }

        if (events.isEmpty()) {
            log.warn("EVENT_BUNDLE tx {} contained no events", txHash);
            return;
        }

        // Idempotency: replace any previously indexed events for this transaction.
        List<EventEntity> existing = eventRepository.findByTxHashOrderByEventId(txHash);
        if (!existing.isEmpty()) {
            eventRepository.deleteAll(existing);
            eventRepository.flush();
        }

        Metadata meta = metadata.getMetadata();
        String version = meta != null ? meta.getVersion() : null;
        Long creationSlot = meta != null ? meta.getCreationSlot() : null;
        String timestamp = meta != null ? meta.getTimestamp() : null;

        // Guard the (tx_hash, event_id) NOT NULL + UNIQUE constraints here so that a single
        // malformed bundle cannot throw on saveAll and roll back the whole yaci block batch.
        List<EventEntity> entities = new ArrayList<>();
        Set<String> seenIds = new HashSet<>();
        int index = 0;
        for (EventBundleEvent event : events) {
            String eventId = event.getId();
            if (eventId == null || eventId.isBlank()) {
                // The schema requires an id; fall back to a stable positional id so a malformed
                // event is still indexed instead of failing the entire batch.
                eventId = "event-" + index;
                log.warn("EVENT_BUNDLE tx {} event #{} has no id; using fallback id '{}'", txHash,
                        index, eventId);
            }
            if (!seenIds.add(eventId)) {
                log.warn("EVENT_BUNDLE tx {} has a duplicate event id '{}'; skipping the duplicate",
                        txHash, eventId);
                index++;
                continue;
            }
            entities.add(toEntity(event, metadata, organisationId, ipfsCid, version, creationSlot,
                    timestamp, eventId));
            index++;
        }
        if (!entities.isEmpty()) {
            eventRepository.saveAll(entities);
        }
    }

    private List<EventBundleEvent> fetchManifestEvents(IpfsEventManifest manifest, String txHash) {
        return ipfsGatewayClient.fetch(manifest.getIpfsCid())
                .map(body -> {
                    try {
                        JsonNode eventsNode = objectMapper.readTree(body).get("events");
                        if (eventsNode == null || eventsNode.isNull()) {
                            log.error("IPFS event document for tx {} has no 'events' array", txHash);
                            return List.<EventBundleEvent>of();
                        }
                        EventBundleEvent[] arr =
                                objectMapper.treeToValue(eventsNode, EventBundleEvent[].class);
                        return Arrays.asList(arr);
                    } catch (Exception e) {
                        log.error("Failed to parse IPFS event document for tx {}: {}", txHash,
                                e.getMessage());
                        return List.<EventBundleEvent>of();
                    }
                })
                .orElseGet(List::of);
    }

    private EventEntity toEntity(EventBundleEvent event, ReeveMetadata metadata,
            String organisationId, String ipfsCid, String version, Long creationSlot,
            String timestamp, String eventId) {
        EventEntity entity = EventEntity.builder()
                .txHash(metadata.getTxHash())
                .organisationId(organisationId)
                .eventId(eventId)
                .eventType(event.getType())
                .eventCategory(event.getCategory().name())
                .fundingTx(event.getFundingTx())
                .fundingId(event.getFundingId())
                .fundingEntity(event.getFundingEntity())
                .date(event.getResolvedDate())
                .version(version)
                .creationSlot(creationSlot)
                .eventTimestamp(timestamp)
                .ipfsCid(ipfsCid)
                .metadataHash(metadata.getMetadataHash())
                .totalAmount(event.getTotalAmount())
                .customData(writeJsonOrNull(event.getCustomDataIfPresent().orElse(null)))
                .raw(writeJsonOrNull(event))
                .build();

        if (event.getAllocations() != null) {
            event.getAllocations().forEach(allocation -> {
                EventAllocationEntity allocationEntity = EventAllocationEntity.builder()
                        .projectId(allocation.getProjectId())
                        .projectTitle(allocation.getProjectTitle())
                        .subProjectTitle(allocation.getSubProjectTitle())
                        .build();
                if (allocation.getMilestones() != null) {
                    allocation.getMilestones().forEach(milestone ->
                            allocationEntity.addMilestone(EventMilestoneEntity.builder()
                                    .milestoneId(milestone.getMilestoneId())
                                    .milestoneTitle(milestone.getMilestoneTitle())
                                    .amountRcy(milestone.getAmountRcy())
                                    .build()));
                }
                entity.addAllocation(allocationEntity);
            });
        }

        if (event.getItems() != null) {
            event.getItems().forEach(item -> {
                String currencyId = Optional.ofNullable(item.getCurrency())
                        .map(c -> c.getId()).orElse(null);
                String custCode = Optional.ofNullable(item.getCurrency())
                        .map(c -> c.getCustCode()).orElse(null);
                if (currencyId != null) {
                    currencyRepository.saveIfNotExists(organisationId, currencyId, custCode);
                }
                entity.addItem(toItemEntity(item, currencyId, custCode));
            });
        }

        return entity;
    }

    private EventItemEntity toItemEntity(EventItem item, String currencyId, String custCode) {
        return EventItemEntity.builder()
                .amountRcy(item.getAmountRcy())
                .amountFcy(item.getAmountFcy())
                .vendor(item.getVendor())
                .spendingCategory(item.getSpendingCategory())
                .fxRate(item.getFxRate())
                .hash(item.getHash())
                .notes(item.getNotes())
                .date(item.getDate())
                .currencyId(currencyId)
                .currencyCustCode(custCode)
                .build();
    }

    private String writeJsonOrNull(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            log.warn("Failed to serialize event JSON: {}", e.getMessage());
            return null;
        }
    }
}
