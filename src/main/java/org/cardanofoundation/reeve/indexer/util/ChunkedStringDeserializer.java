package org.cardanofoundation.reeve.indexer.util;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

/**
 * Deserialises a free-text metadata field that may arrive as a plain JSON string or, when the
 * original value was over 64 bytes, as a JSON array of chunks. Cardano's on-chain metadata limits
 * every individual CBOR text string to 64 bytes; a longer value (e.g. a long milestone title) is
 * split by the writer into an array of &le;64-byte pieces with no separator, so it must be
 * reassembled here by plain concatenation (not joined with a delimiter) to recover the original
 * text. Apply via {@code @JsonDeserialize(using = ChunkedStringDeserializer.class)} on any field
 * fed by a schema {@code freeText}/{@code freeTextOptional} definition (vendor, notes, spending
 * category, funding entity, milestone/project/sub-project title, org name/tax id, etc.).
 */
public class ChunkedStringDeserializer extends StdDeserializer<String> {

    public ChunkedStringDeserializer() {
        this(null);
    }

    public ChunkedStringDeserializer(Class<?> vc) {
        super(vc);
    }

    @Override
    public String deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        JsonNode node = parser.getCodec().readTree(parser);
        if (node == null || node.isNull()) {
            return null;
        }
        if (node.isArray()) {
            StringBuilder sb = new StringBuilder();
            node.forEach(chunk -> sb.append(chunk.asText()));
            return sb.toString();
        }
        return node.asText();
    }
}
