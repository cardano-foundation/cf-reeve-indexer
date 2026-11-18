package org.cardanofoundation.reeve.indexer.model.view;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.EventEntity;

class EventViewTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void fromEntityCarriesBlockTime() {
        EventEntity entity = EventEntity.builder()
                .txHash("tx-1").eventId("event-1").blockTime(1736899200L).build();

        EventView view = EventView.fromEntity(entity, objectMapper);

        assertEquals(1736899200L, view.getBlockTime());
    }
}
