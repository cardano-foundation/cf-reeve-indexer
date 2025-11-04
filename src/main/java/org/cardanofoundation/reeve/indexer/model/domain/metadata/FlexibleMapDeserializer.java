package org.cardanofoundation.reeve.indexer.model.domain.metadata;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;

public class FlexibleMapDeserializer extends JsonDeserializer<Map<String, Object>> {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public Map<String, Object> deserialize(JsonParser jp, DeserializationContext ctxt) throws IOException {
        JsonToken token = jp.getCurrentToken();

        if (token == JsonToken.START_OBJECT) {
            // It's a JSON object, deserialize as map
            return mapper.readValue(jp, mapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class));
        } else if (token == JsonToken.START_ARRAY) {
            // It's an array, wrap it in a map with a default key
            Object array = mapper.readValue(jp, Object.class);
            Map<String, Object> result = new HashMap<>();
            result.put("values", array);
            return result;
        }

        // Handle other cases as empty map
        return new HashMap<>();
    }
}
