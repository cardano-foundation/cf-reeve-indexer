package org.cardanofoundation.reeve.indexer.model.domain.metadata;

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
    // data hash
    private String d;
    // Identifier
    private String i;
    // Type
    private String type;

}
