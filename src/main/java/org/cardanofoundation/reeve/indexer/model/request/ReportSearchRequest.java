package org.cardanofoundation.reeve.indexer.model.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class ReportSearchRequest {

    @Schema(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94")
    private String organisationId;

    @ArraySchema(
        arraySchema = @Schema(description = "List of report types to filter by"),
        schema = @Schema(example = "INCOME_STATEMENT")
    )
    private List<String> reportType;

    @ArraySchema(
        arraySchema = @Schema(description = "List of interval types to filter by (MONTH, QUARTER, YEAR)"),
        schema = @Schema(example = "QUARTER")
    )
    private List<String> intervalType;

    private String blockChainHash;

    private String currency;

    @ArraySchema(
        arraySchema = @Schema(description = "List of years to filter by"),
        schema = @Schema(example = "2024")
    )
    private List<Integer> year;

    @ArraySchema(
        arraySchema = @Schema(description = "List of periods to filter by"),
        schema = @Schema(example = "3")
    )
    private List<Integer> period;
}
