package org.cardanofoundation.reeve.indexer.model.request;

import java.time.LocalDate;
import java.util.Set;

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
public class TransactionsSearchRequest {

    @Schema(example = "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94")
    private String organisationId;

    @Schema(example = "2023-01-01")
    private LocalDate dateFrom;

    @Schema(example = "2023-31-01")
    private LocalDate dateTo;

    private Set<String> transactionInternalNumber;

    private Set<String> events;

    private Set<String> currency;

    private Double minAmountLcy;

    private Double maxAmountLcy;

    private Double minAmountFcy;

    private Double maxAmountFcy;

    private Set<String> transactionHashes;

    private Set<String> documentNumber;

    private Set<String> type;

    private Set<String> vatCustCode;

    private Set<String> costCenterCustCode;

    private Set<String> projectCustCode;

    private Set<String> counterPartyType;

    private Set<String> counterPartyCustCode;

}
