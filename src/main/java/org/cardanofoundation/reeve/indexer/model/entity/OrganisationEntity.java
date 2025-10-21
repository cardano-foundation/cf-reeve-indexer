package org.cardanofoundation.reeve.indexer.model.entity;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reeve_organisation")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class OrganisationEntity {

    @Id
    private String txHash;
    private String id;
    private String name;
    private String currencyId;
    private String countryCode;
    private String taxIdNumber;
    private List<String> assets;
}
