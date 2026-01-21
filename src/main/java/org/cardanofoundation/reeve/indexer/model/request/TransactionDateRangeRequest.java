package org.cardanofoundation.reeve.indexer.model.request;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import io.swagger.v3.oas.annotations.media.Schema;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class TransactionDateRangeRequest {

    @Schema(description = "Optional organization ID to filter by organization", example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94")
    private String organisationId;

    @Schema(description = "Start date for filtering transactions (inclusive)", example = "2025-03-21")
    private LocalDate dateFrom;

    @Schema(description = "End date for filtering transactions (inclusive)", example = "2025-03-21")
    private LocalDate dateTo;
}
