package org.cardanofoundation.reeve.indexer.model.request;

import java.time.LocalDate;

import lombok.Data;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
public class TransactionDateRangeRequest {

    @Schema(description = "Optional organization ID to filter by organization", example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94")
    private String organisationId;

    @Schema(description = "Start date for filtering transactions (inclusive)", example = "2024-01-01")
    private LocalDate dateFrom;

    @Schema(description = "End date for filtering transactions (inclusive)", example = "2024-01-31")
    private LocalDate dateTo;
}
