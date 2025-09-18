package org.cardanofoundation.reeve.indexer.util;

import java.io.IOException;
import java.util.Arrays;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.ObjectCodec;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import org.cardanofoundation.reeve.indexer.model.domain.Identity;
import org.cardanofoundation.reeve.indexer.model.domain.Interval;
import org.cardanofoundation.reeve.indexer.model.domain.Metadata;
import org.cardanofoundation.reeve.indexer.model.domain.Organisation;
import org.cardanofoundation.reeve.indexer.model.domain.RawMetadata;
import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.Transaction;

public class RawMetadataDeserializer extends StdDeserializer<RawMetadata> {

    public RawMetadataDeserializer() {
        this(null);
    }

    public RawMetadataDeserializer(Class<?> vc) {
        super(vc);
    }

    @Override
    public RawMetadata deserialize(JsonParser parser, DeserializationContext context) throws IOException {
        // Get the codec from the parser to work with JSON nodes
        ObjectCodec codec = parser.getCodec();
        // Read the entire JSON structure into a JsonNode tree
        JsonNode rootNode = codec.readTree(parser);

        // 1. Determine the 'type' of the transaction
        JsonNode typeNode = rootNode.get("type");
        if (typeNode == null || typeNode.isNull()) {
            throw new IOException("'type' field is missing or null");
        }
        ReeveTransactionType type = ReeveTransactionType.valueOf(typeNode.asText());

        // 2. Deserialize the 'data' field based on the 'type'
        JsonNode dataNode = rootNode.get("data");
        Object data = null;

        if (dataNode != null && !dataNode.isNull()) {
            switch (type) {
                case INDIVIDUAL_TRANSACTIONS:
                    // If the type indicates transactions, parse 'data' as an array of Transaction
                    Transaction[] transactions = codec.treeToValue(dataNode, Transaction[].class);
                    data = Arrays.asList(transactions);
                    break;

                case REPORT:
                    // If the type is a report, parse 'data' as a ReportData object
                    data = dataNode.toString();
                    break;

                default:
                    // Handle other types or throw an error if necessary
                    break;
            }
        }

        // 3. Manually construct the RawMetadata object
        // This approach avoids trying to deserialize 'data' twice.
        RawMetadata rawMetadata = new RawMetadata();
        rawMetadata.setType(type);
        rawMetadata.setData(data);

        // Deserialize other fields as needed (this example keeps it simple)
        // For a full implementation, you would map all other fields from rootNode here.
        if (rootNode.has("ver")) {
            rawMetadata.setVer(rootNode.get("ver").asLong());
        }
        if (rootNode.has("year")) {
            rawMetadata.setYear(rootNode.get("year").asInt());
        }
        if (rootNode.has("subType")) {
            rawMetadata.setSubType(rootNode.get("subType").asText());
        }
        if (rootNode.has("interval")) {
            String intervalText = rootNode.get("interval").asText();
            rawMetadata.setInterval(Interval.valueOf(intervalText));
        }
        if (rootNode.has("period")) {
            rawMetadata.setPeriod(rootNode.get("period").asInt());
        }
        if (rootNode.has("org")) {
            JsonNode orgNode = rootNode.get("org");
            if (orgNode != null && !orgNode.isNull()) {
                // Assuming Organisation is a class that can be deserialized from JSON
                rawMetadata.setOrg(codec.treeToValue(orgNode, Organisation.class));
            }
        }

        if (rootNode.has("identifier")) {
            JsonNode idNode = rootNode.get("identifier");
            if (idNode != null && !idNode.isNull()) {
                // Assuming Identity is a class that can be deserialized from JSON
                rawMetadata.setIdentifier(codec.treeToValue(idNode, Identity.class));
            }
        }

        if (rootNode.has("metadata")) {
            JsonNode metadataNode = rootNode.get("metadata");
            if (metadataNode != null && !metadataNode.isNull()) {
                // Assuming Metadata is a class that can be deserialized from JSON
                rawMetadata.setMetadata(codec.treeToValue(metadataNode, Metadata.class));
            }
        }

        return rawMetadata;
    }
}
