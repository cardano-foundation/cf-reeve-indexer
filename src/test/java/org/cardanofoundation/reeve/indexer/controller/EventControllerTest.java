package org.cardanofoundation.reeve.indexer.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.request.EventSearchRequest;
import org.cardanofoundation.reeve.indexer.model.view.EventResponseView;
import org.cardanofoundation.reeve.indexer.model.view.EventView;
import org.cardanofoundation.reeve.indexer.service.EventService;
import org.cardanofoundation.reeve.indexer.service.OrganisationService;

class EventControllerTest {

    private EventService eventService;
    private OrganisationService organisationService;
    private EventController controller;

    @BeforeEach
    void setUp() {
        eventService = mock(EventService.class);
        organisationService = mock(OrganisationService.class);
        controller = new EventController(eventService, organisationService);
    }

    @Test
    void searchReturnsEventsForKnownOrganisation() {
        EventSearchRequest request = new EventSearchRequest();
        request.setOrganisationId("org1");
        Pageable pageable = PageRequest.of(0, 20);

        when(organisationService.findById("org1"))
                .thenReturn(Optional.of(new OrganisationEntity()));
        EventView view = EventView.builder().id(1L).eventId("e1").eventType("SPENDING").build();
        Page<EventView> page = new PageImpl<>(List.of(view), pageable, 1);
        when(eventService.search(eq(request), any())).thenReturn(page);

        ResponseEntity<EventResponseView> response =
                controller.eventSearchPublicInterface(request, pageable);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().getSuccess());
        assertEquals(1, response.getBody().getTotal());
        assertEquals(1, response.getBody().getEvents().size());
        assertEquals("e1", response.getBody().getEvents().get(0).getEventId());
    }

    @Test
    void searchReturnsNotFoundForUnknownOrganisation() {
        EventSearchRequest request = new EventSearchRequest();
        request.setOrganisationId("missing");
        when(organisationService.findById("missing")).thenReturn(Optional.empty());

        ResponseEntity<EventResponseView> response =
                controller.eventSearchPublicInterface(request, PageRequest.of(0, 20));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertFalse(response.getBody().getSuccess());
        assertTrue(response.getBody().getError().isPresent());
    }

    @Test
    void getEventsByTxHashWrapsResults() {
        when(eventService.findByTxHash("tx1"))
                .thenReturn(List.of(EventView.builder().eventId("e1").build()));

        ResponseEntity<EventResponseView> response = controller.getEventsByTxHash("tx1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().getSuccess());
        assertEquals(1, response.getBody().getTotal());
    }
}
