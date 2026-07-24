package org.cardanofoundation.reeve.indexer.model.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/** Body of {@code POST /api/v1/cards/attestation/ceremonies/{id}/pair} (design doc Part A / A6). */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class CardCeremonyPairRequest {

    private String walletOobiUrl;
}
