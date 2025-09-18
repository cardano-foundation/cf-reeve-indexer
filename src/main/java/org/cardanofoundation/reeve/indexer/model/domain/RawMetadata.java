package org.cardanofoundation.reeve.indexer.model.domain;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.cardanofoundation.reeve.indexer.util.RawMetadataDeserializer;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
@JsonDeserialize(using = RawMetadataDeserializer.class)
public class RawMetadata {

    private String txHash;

    private Organisation org;
    private Long ver;
    private ReeveTransactionType type;
    private Metadata metadata;
    private Identity identifier;

    private Object data;
    private List<Transaction> transactions;

    // In case it's a report
    private Interval interval;
    private Integer year;
    private Integer period;
    private String subType;
}
