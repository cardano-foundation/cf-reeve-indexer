package org.cardanofoundation.reeve.indexer.model.domain.metadata;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityMetadata {

    private String txHash;
    // Sequence Number
    private String s;
    // event hash
    private String d;
    // data hash
    private String a;
    // Identifier
    private String i;
    // Type
    private IdentityType type;

    private EventAndAttachments vcp;
    private EventAndAttachments iss;
    private List<Map<String, Object>> acdc;
    private List<String> prefix;
}
