package org.cardanofoundation.reeve.indexer.model.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Search criteria for {@code EVENT_BUNDLE} events. All filters are optional and combined with AND;
 * a null/empty filter is ignored. Pagination and sorting are supplied via the standard
 * {@code Pageable} query parameters ({@code page}, {@code size}, {@code sort}).
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class EventSearchRequest {

    @Schema(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94")
    private String organisationId;

    @ArraySchema(
        arraySchema = @Schema(description = "Event types to filter by (FUNDING, SPENDING, REFUND or a custom type)"),
        schema = @Schema(example = "SPENDING"))
    private Set<String> eventTypes;

    @ArraySchema(
        arraySchema = @Schema(description = "Event categories to filter by"),
        schema = @Schema(example = "GRANT"))
    private Set<String> categories;

    @ArraySchema(
        arraySchema = @Schema(description = "Project ids to filter by"),
        schema = @Schema(example = "ProjectID1"))
    private Set<String> projectIds;

    @ArraySchema(
        arraySchema = @Schema(description = "Funding ids to filter by"),
        schema = @Schema(example = "fund1"))
    private Set<String> fundingIds;

    @Schema(description = "Blockchain (transaction) hash to filter by")
    private String blockChainHash;

    @Schema(example = "2025-01-01")
    private LocalDate dateFrom;

    @Schema(example = "2025-12-31")
    private LocalDate dateTo;

    @Schema(description = "Minimum event total amount in reporting currency")
    private BigDecimal minAmount;

    @Schema(description = "Maximum event total amount in reporting currency")
    private BigDecimal maxAmount;
}
