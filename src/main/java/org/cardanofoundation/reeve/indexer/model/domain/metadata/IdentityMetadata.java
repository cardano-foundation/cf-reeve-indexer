package org.cardanofoundation.reeve.indexer.model.domain.metadata;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityMetadata {

    private String txHash;
    // Sequence Number
    private String s;
    // data hash
    private String d;
    // Identifier
    private String i;
    // Credential Data
    @JsonDeserialize(using = RawJsonDeserializer.class)
    private String c;
    // Type
    private IdentityType t;
    // Additional Information
    @JsonDeserialize(using = FlexibleMapDeserializer.class)
    private Map<String, Object> m;
}
