package org.cardanofoundation.reeve.indexer.model.view;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.math.BigDecimal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.model.entity.EventAllocationEntity;
import org.cardanofoundation.reeve.indexer.model.entity.EventMilestoneEntity;

class EventAllocationViewTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void exposesProIdAlongsideIdsAndTitles() {
        EventAllocationEntity allocation = EventAllocationEntity.builder()
                .projectId("P1").projectTitle("Project One").proId("PRJ-001")
                .subProjectId("SP1").subProjectTitle("Sub One").subProjectProId("PRJ-001-1")
                .build();
        allocation.addMilestone(EventMilestoneEntity.builder()
                .milestoneId("ms1").milestoneTitle("Milestone 1").proId("PRJ-001-1-1")
                .allocatedAmount(new BigDecimal("100")).build());

        JsonNode json = objectMapper.valueToTree(EventAllocationView.fromEntity(allocation));

        assertEquals("PRJ-001", json.get("proId").asText());
        assertEquals("PRJ-001-1", json.get("subProjectProId").asText());
        assertEquals("PRJ-001-1-1", json.get("milestones").get(0).get("proId").asText());
    }

    @Test
    void omitsProIdForRowsIndexedBeforeItWasPublished() {
        EventAllocationEntity allocation = EventAllocationEntity.builder()
                .projectId("P1").projectTitle("Project One").build();
        allocation.addMilestone(EventMilestoneEntity.builder()
                .milestoneId("ms1").milestoneTitle("Milestone 1")
                .allocatedAmount(new BigDecimal("100")).build());

        JsonNode json = objectMapper.valueToTree(EventAllocationView.fromEntity(allocation));

        assertFalse(json.has("proId"));
        assertFalse(json.has("subProjectProId"));
        assertFalse(json.get("milestones").get(0).has("proId"));
    }
}
