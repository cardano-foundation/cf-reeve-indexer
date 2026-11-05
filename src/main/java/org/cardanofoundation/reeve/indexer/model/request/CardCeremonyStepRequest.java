package org.cardanofoundation.reeve.indexer.model.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * Optional body of {@code POST .../present-credential} and {@code POST .../attest}: {@code retry}
 * defaults to {@code false} (a fresh attempt) when the body is omitted entirely — the controller
 * treats a {@code null} request the same as {@code retry=false}.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class CardCeremonyStepRequest {

    private boolean retry;
}
