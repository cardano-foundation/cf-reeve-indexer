package org.cardanofoundation.reeve.indexer.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reeve_identity")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class IdentityEntity {

    @Id
    private String txHash;
    private String sequenceNumber;
    private String dataHash;
    private String identifier;
    private String type;
}
