package org.cardanofoundation.reeve.indexer.model.entity.converter;

import java.util.List;
import java.util.Map;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Converter(autoApply = false)
public class MapListConverter implements AttributeConverter<List<Map<String, Object>>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<Map<String, Object>> attribute) {
        try {
            return attribute == null ? null : MAPPER.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert Map List to JSON", e);
        }
    }

    @Override
    public List<Map<String, Object>> convertToEntityAttribute(String dbData) {
        try {
            return dbData == null ? null : MAPPER.readValue(dbData, new TypeReference<List<Map<String, Object>>>(){});
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert JSON to Map List", e);
        }
    }
}
