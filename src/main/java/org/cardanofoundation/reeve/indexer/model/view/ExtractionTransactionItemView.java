package org.cardanofoundation.reeve.indexer.model.view;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionItemEntity;

@Getter
@Setter
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ExtractionTransactionItemView {

    private String id;

    private String transactionInternalNumber;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate entryDate;

    private String transactionType;
    private String blockChainHash;
    private BigDecimal amountLcy;
    private String fxRate;
    private String costCenterCustomerCode;
    private String costCenterName;
    private String projectCustomerCode;
    private String projectName;
    private String accountEventCode;
    private String accountEventName;
    private String documentNum;
    private String documentCurrencyCustomerCode;
    private String vatCustomerCode;
    private String vatRate;
    private String counterPartyType;
    private String counterPartyCustCode;

    public static ExtractionTransactionItemView fromEntity(TransactionItemEntity entity) {
        return ExtractionTransactionItemView.builder()
                .id(entity.getId())
                .transactionInternalNumber(entity.getTransaction().getNumber())
                .entryDate(entity.getTransaction().getDate())
                .transactionType(entity.getTransaction().getType())
                .blockChainHash(entity.getTransaction().getTxHash())
                .amountLcy(entity.getAmount()).fxRate(entity.getFxRate())
                .documentNum(entity.getDocumentNumber())
                .documentCurrencyCustomerCode(entity.getCurrency())
                .costCenterCustomerCode(entity.getCostCenterCustCode())
                .costCenterName(entity.getCostCenterName())
                .vatRate(entity.getVatRate())
                .vatCustomerCode(entity.getVatCustCode())
                .accountEventCode(entity.getEventCode())
                .accountEventName(entity.getEventName())
                .projectCustomerCode(entity.getProjectCustCode())
                .projectName(entity.getProjectName())
                .counterPartyType(entity.getCounterPartyType())
                .counterPartyCustCode(entity.getCounterPartyCustCode())
                .build();
    }
}
