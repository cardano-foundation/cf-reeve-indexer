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
import org.cardanofoundation.reeve.indexer.model.domain.event.FundingEvent;
import org.cardanofoundation.reeve.indexer.model.domain.event.IpfsEventManifest;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.EventAllocationEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventMilestoneEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CurrencyRepository;
import org.cardanofoundation.reeve.indexer.model.repository.EventRepository;

/**
 * Persists {@code FUNDING} transactions. The bundle {@code data} is either an inline array of events
 * or an IPFS manifest; in the latter case the off-chain document is resolved and its events are
 * stored exactly like inline ones (with the originating CID recorded). Processing is idempotent per
 * transaction so re-indexing/rollbacks do not create duplicates.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FundingEventProcessor implements ReeveTypeProcessor {

    private final EventRepository eventRepository;
    private final CurrencyRepository currencyRepository;
    private final ObjectMapper objectMapper;
    private final IpfsGatewayClient ipfsGatewayClient;

    @Override
    public ReeveTransactionType supportedType() {
        return ReeveTransactionType.FUNDING;
    }

    @Override
    public void process(ReeveMetadata metadata) {
        String txHash = metadata.getTxHash();
        String organisationId = metadata.getOrg().getId();

        List<FundingEvent> events = new ArrayList<>();
        String ipfsCid = null;

        Object data = metadata.getData();
        if (data instanceof List<?> inline) {
            inline.forEach(e -> events.add((FundingEvent) e));
        } else if (data instanceof IpfsEventManifest manifest) {
            ipfsCid = manifest.getIpfsCid();
            events.addAll(fetchManifestEvents(manifest, txHash));
        } else if (data != null) {
            log.warn("Unexpected FUNDING data type {} for tx {}", data.getClass(), txHash);
        }

        if (events.isEmpty()) {
            log.warn("FUNDING tx {} contained no events", txHash);
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
        for (FundingEvent event : events) {
            String eventId = event.getId();
            if (eventId == null || eventId.isBlank()) {
                // The schema requires an id; fall back to a stable positional id so a malformed
                // event is still indexed instead of failing the entire batch.
                eventId = "event-" + index;
                log.warn("FUNDING tx {} event #{} has no id; using fallback id '{}'", txHash,
                        index, eventId);
            }
            if (!seenIds.add(eventId)) {
                log.warn("FUNDING tx {} has a duplicate event id '{}'; skipping the duplicate",
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

    private List<FundingEvent> fetchManifestEvents(IpfsEventManifest manifest, String txHash) {
        return ipfsGatewayClient.fetch(manifest.getIpfsCid())
                .map(body -> {
                    try {
                        JsonNode eventsNode = objectMapper.readTree(body).get("events");
                        if (eventsNode == null || eventsNode.isNull()) {
                            log.error("IPFS event document for tx {} has no 'events' array", txHash);
                            return List.<FundingEvent>of();
                        }
                        FundingEvent[] arr =
                                objectMapper.treeToValue(eventsNode, FundingEvent[].class);
                        return Arrays.asList(arr);
                    } catch (Exception e) {
                        log.error("Failed to parse IPFS event document for tx {}: {}", txHash,
                                e.getMessage());
                        return List.<FundingEvent>of();
                    }
                })
                .orElseGet(List::of);
    }

    private EventEntity toEntity(FundingEvent event, ReeveMetadata metadata, String organisationId,
            String ipfsCid, String version, Long creationSlot, String timestamp, String eventId) {
        String currencyId = Optional.ofNullable(event.getCurrency())
                .map(c -> c.getId()).orElse(null);
        String custCode = Optional.ofNullable(event.getCurrency())
                .map(c -> c.getCustCode()).orElse(null);
        if (currencyId != null) {
            currencyRepository.saveIfNotExists(organisationId, currencyId, custCode);
        }

        EventEntity entity = EventEntity.builder()
                .txHash(metadata.getTxHash())
                .organisationId(organisationId)
                .eventId(eventId)
                .eventType(event.getType())
                .eventCategory(event.getCategory().name())
                .fundingTx(event.getFundingTx())
                .fundingId(event.getFundingId())
                .fundingEntity(event.getFundingEntity())
                .amountRcy(event.getAmountRcy())
                .amountFcy(event.getAmountFcy())
                .vendor(event.getVendor())
                .spendingCategory(event.getSpendingCategory())
                .fxRate(event.getFxRate())
                .hash(event.getHash())
                .notes(event.getNotes())
                .currencyId(currencyId)
                .currencyCustCode(custCode)
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
                        .subProjectId(allocation.getSubProjectId())
                        .subProjectTitle(allocation.getSubProjectTitle())
                        .build();
                if (allocation.getEffectiveMilestones() != null) {
                    allocation.getEffectiveMilestones().forEach(milestone ->
                            allocationEntity.addMilestone(EventMilestoneEntity.builder()
                                    .milestoneId(milestone.getMilestoneId())
                                    .milestoneTitle(milestone.getMilestoneTitle())
                                    .allocatedAmount(milestone.getAllocatedAmount())
                                    .build()));
                }
                entity.addAllocation(allocationEntity);
            });
        }

        return entity;
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
