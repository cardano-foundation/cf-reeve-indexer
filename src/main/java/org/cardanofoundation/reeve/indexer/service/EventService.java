package org.cardanofoundation.reeve.indexer.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.entity.EventEntity;
import org.cardanofoundation.reeve.indexer.model.repository.EventRepository;
import org.cardanofoundation.reeve.indexer.model.request.EventSearchRequest;
import org.cardanofoundation.reeve.indexer.model.view.EventProjectView;
import org.cardanofoundation.reeve.indexer.model.view.EventView;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private final ObjectMapper objectMapper;

    /** Maps client-facing sort keys to the search query's entity paths (alias {@code e}). */
    private static final Map<String, String> SORT_FIELD_MAPPING = new HashMap<>();
    private static final String DEFAULT_SORT_FIELD = "e.date";

    static {
        SORT_FIELD_MAPPING.put("date", "e.date");
        SORT_FIELD_MAPPING.put("eventType", "e.eventType");
        SORT_FIELD_MAPPING.put("eventCategory", "e.eventCategory");
        SORT_FIELD_MAPPING.put("totalAmount", "e.totalAmount");
        SORT_FIELD_MAPPING.put("fundingId", "e.fundingId");
        SORT_FIELD_MAPPING.put("fundingEntity", "e.fundingEntity");
        SORT_FIELD_MAPPING.put("eventId", "e.eventId");
        SORT_FIELD_MAPPING.put("txHash", "e.txHash");
        SORT_FIELD_MAPPING.put("blockChainHash", "e.txHash");
    }

    @Transactional(readOnly = true)
    public Page<EventView> search(EventSearchRequest request, Pageable pageable) {
        Pageable sortedPageable = remapSort(pageable);

        Page<EventEntity> events = eventRepository.search(
                request.getOrganisationId(),
                nullIfEmpty(request.getEventTypes()),
                nullIfEmpty(request.getCategories()),
                nullIfEmpty(request.getProjectIds()),
                nullIfEmpty(request.getFundingIds()),
                request.getBlockChainHash(),
                request.getDateFrom(),
                request.getDateTo(),
                request.getMinAmount(),
                request.getMaxAmount(),
                sortedPageable);

        return events.map(entity -> EventView.fromEntity(entity, objectMapper));
    }

    @Transactional(readOnly = true)
    public List<EventView> findByTxHash(String txHash) {
        return eventRepository.findByTxHashOrderByEventId(txHash).stream()
                .map(entity -> EventView.fromEntity(entity, objectMapper))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> findDistinctEventTypes(String organisationId) {
        return eventRepository.findDistinctEventTypesByOrganisationId(organisationId);
    }

    @Transactional(readOnly = true)
    public List<EventProjectView> findDistinctProjects(String organisationId) {
        return eventRepository.findDistinctProjectsByOrganisationId(organisationId);
    }

    private Pageable remapSort(Pageable pageable) {
        if (pageable.getSort().isUnsorted()) {
            return pageable;
        }
        Sort mappedSort = Sort.by(pageable.getSort().stream()
                .map(order -> new Sort.Order(order.getDirection(),
                        SORT_FIELD_MAPPING.getOrDefault(order.getProperty(), DEFAULT_SORT_FIELD)))
                .collect(Collectors.toList()));
        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), mappedSort);
    }

    private static <T> Set<T> nullIfEmpty(Set<T> set) {
        return set == null || set.isEmpty() ? null : set;
    }
}
