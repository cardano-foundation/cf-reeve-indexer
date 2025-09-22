package org.cardanofoundation.reeve.indexer.model.domain.metadata;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.cardanofoundation.reeve.indexer.model.domain.Interval;
import org.cardanofoundation.reeve.indexer.model.domain.Metadata;
import org.cardanofoundation.reeve.indexer.model.domain.Organisation;
import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.Transaction;
import org.cardanofoundation.reeve.indexer.util.ReeveMetadataDeserializer;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
@JsonDeserialize(using = ReeveMetadataDeserializer.class)
public class ReeveMetadata {

    private String txHash;
    private String metadataHash;

    private Organisation org;
    private Long ver;
    private ReeveTransactionType type;
    private Metadata metadata;

    private Object data;
    private List<Transaction> transactions;

    // In case it's a report
    private Interval interval;
    private Integer year;
    private Integer period;
    private String subType;
}
