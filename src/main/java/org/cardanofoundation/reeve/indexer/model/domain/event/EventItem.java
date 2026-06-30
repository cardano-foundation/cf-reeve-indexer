package org.cardanofoundation.reeve.indexer.model.domain.event;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.model.domain.Currency;

/**
 * A line item of a grant-lifecycle event (e.g. an expenditure for a {@code SPENDING} event).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class EventItem {

    private BigDecimal amountRcy;
    private BigDecimal amountFcy;
    private String vendor;
    private String spendingCategory;
    private String fxRate;
    private String hash;
    private String notes;
    private LocalDate date;
    private Currency currency;
}
