package org.cardanofoundation.reeve.indexer.model.domain.metadata;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.JsonNode;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class EventAndAttachments {

    private List<Map<String, Object>> events;
    private List<String> attachments;

    @JsonSetter("attachments")
    public void setAttachments(Object attachmentsValue) {
        if (attachmentsValue == null) {
            this.attachments = new ArrayList<>();
        } else if (attachmentsValue instanceof String) {
            this.attachments = Arrays.asList((String) attachmentsValue);
        } else if (attachmentsValue instanceof List) {
            @SuppressWarnings("unchecked")
            List<String> list = (List<String>) attachmentsValue;
            this.attachments = list;
        } else if (attachmentsValue instanceof JsonNode) {
            JsonNode node = (JsonNode) attachmentsValue;
            if (node.isArray()) {
                this.attachments = new ArrayList<>();
                node.forEach(item -> this.attachments.add(item.asText()));
            } else {
                this.attachments = Arrays.asList(node.asText());
            }
        } else {
            this.attachments = new ArrayList<>();
        }
    }

}
