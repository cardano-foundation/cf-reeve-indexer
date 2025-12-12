package org.cardanofoundation.reeve.indexer.model.view;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionItemEntity;

@RequiredArgsConstructor
@AllArgsConstructor
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class TransactionItemFullView {

    private String id;
    private BigDecimal amountFcy;
    private BigDecimal amountLcy;
    private String fxRate;
    private String documentNumber;
    private String currency;
    private String costCenterName;
    private String costCenterCustCode;
    private String vatRate;
    private String vatCustCode;
    private String eventCode;
    private String eventName;
    private String projectCustCode;
    private String projectName;
    private String counterPartyType;
    private String counterPartyCustCode;

    public static TransactionItemFullView fromEntity(TransactionItemEntity entity) {
        return TransactionItemFullView.builder()
                .id(entity.getId())
                .amountFcy(entity.getAmountFcy())
                .amountLcy(entity.getAmountLcy())
                .fxRate(entity.getFxRate())
                .documentNumber(entity.getDocumentNumber())
                .currency(entity.getCurrency())
                .costCenterName(entity.getCostCenterName())
                .costCenterCustCode(entity.getCostCenterCustCode())
                .vatRate(entity.getVatRate())
                .vatCustCode(entity.getVatCustCode())
                .eventCode(entity.getEventCode())
                .eventName(entity.getEventName())
                .projectCustCode(entity.getProjectCustCode())
                .projectName(entity.getProjectName())
                .counterPartyType(entity.getCounterPartyType())
                .counterPartyCustCode(entity.getCounterPartyCustCode())
                .build();
    }
}
