package org.cardanofoundation.reeve.indexer.model.entity.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.domain.metadata.EventAndAttachments;


@Converter(autoApply = false)
public class EventAndAttachmentsConverter implements AttributeConverter<EventAndAttachments, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(EventAndAttachments attribute) {
        try {
            return attribute == null ? null : MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert EventAndAttachments to JSON", e);
        }
    }

    @Override
    public EventAndAttachments convertToEntityAttribute(String dbData) {
        try {
            return dbData == null ? null : MAPPER.readValue(dbData, EventAndAttachments.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert JSON to EventAndAttachments", e);
        }
    }
}
