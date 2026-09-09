package org.cardanofoundation.reeve.indexer.model.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.util.ChunkedStringDeserializer;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class Organisation {

    private String id;
    @JsonDeserialize(using = ChunkedStringDeserializer.class)
    private String name;
    private String currencyId;
    private String countryCode;
    @JsonDeserialize(using = ChunkedStringDeserializer.class)
    private String taxIdNumber;

    public static Organisation fromEntity(OrganisationEntity organisationEntity) {
        if (organisationEntity == null) {
            return null;
        }
        return Organisation.builder()
                .id(organisationEntity.getId())
                .name(organisationEntity.getName())
                .currencyId(organisationEntity.getCurrencyId())
                .countryCode(organisationEntity.getCountryCode())
                .taxIdNumber(organisationEntity.getTaxIdNumber())
                .build();
    }
}
