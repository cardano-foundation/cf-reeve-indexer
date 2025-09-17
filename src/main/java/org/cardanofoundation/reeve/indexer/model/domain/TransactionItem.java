package org.cardanofoundation.reeve.indexer.model.domain;

import java.math.BigDecimal;
import java.util.Optional;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionItemEntity;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionItem {

        private String id;
        private BigDecimal amount;
        private String fxRate;
        private Document document;
        private CostCenter costCenter;
        private Project project;
        private CounterParty counterParty;
        private Event event;

        public TransactionItemEntity toEntity() {
                return TransactionItemEntity.builder().id(id).amount(amount).fxRate(fxRate)
                                .documentNumber(Optional.ofNullable(document)
                                                .map(Document::getNumber).orElse(null))
                                .currency(Optional.ofNullable(document).map(Document::getCurrency)
                                                .map(Currency::getId).orElse(null))
                                .costCenterCustCode(Optional.ofNullable(costCenter)
                                                .map(CostCenter::getCustCode).orElse(null))
                                .costCenterName(Optional.ofNullable(costCenter)
                                                .map(CostCenter::getName).orElse(null))
                                .vatRate(Optional.ofNullable(document).map(Document::getVat)
                                                .map(Vat::getRate).orElse(null))
                                .vatCustCode(Optional.ofNullable(document).map(Document::getVat)
                                                .map(Vat::getCustCode).orElse(null))
                                .projectCustCode(Optional.ofNullable(project)
                                                .map(Project::getCustCode).orElse(null))
                                .projectName(Optional.ofNullable(project)
                                                .map(Project::getName).orElse(null))
                                .eventCode(Optional.ofNullable(event)
                                                .map(Event::getCode).orElse(null))
                                .eventName(Optional.ofNullable(event)
                                                .map(Event::getName).orElse(null))
                                .build();
        }

}
