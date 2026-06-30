package org.cardanofoundation.reeve.indexer.model.view;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.model.entity.EventItemEntity;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventItemView {

    private BigDecimal amountRcy;
    private BigDecimal amountFcy;
    private String vendor;
    private String spendingCategory;
    private String fxRate;
    private String hash;
    private String notes;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String currencyId;
    private String currencyCustCode;

    public static EventItemView fromEntity(EventItemEntity entity) {
        return EventItemView.builder()
                .amountRcy(entity.getAmountRcy())
                .amountFcy(entity.getAmountFcy())
                .vendor(entity.getVendor())
                .spendingCategory(entity.getSpendingCategory())
                .fxRate(entity.getFxRate())
                .hash(entity.getHash())
                .notes(entity.getNotes())
                .date(entity.getDate())
                .currencyId(entity.getCurrencyId())
                .currencyCustCode(entity.getCurrencyCustCode())
                .build();
    }
}
