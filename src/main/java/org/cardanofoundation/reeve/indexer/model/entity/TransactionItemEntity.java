package org.cardanofoundation.reeve.indexer.model.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reeve_transaction_item")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
@Getter
public class TransactionItemEntity {

    @Id
    @Column(name = "id", nullable = false)
    private String id;
    @Column(name = "amount_lcy", nullable = false)
    private BigDecimal amountLcy;
    @Column(name = "fx_rate", nullable = false)
    private String fxRate;
    @Column(name = "document_number")
    private String documentNumber;
    @Column(name = "currency")
    private String currency;
    @Column(name = "costcenter_name")
    private String costCenterName;
    @Column(name = "costcenter_cust_code")
    private String costCenterCustCode;
    @Column(name = "vat_rate")
    private String vatRate;
    @Column(name = "vat_cust_code")
    private String vatCustCode;
    @Column(name = "event_code")
    private String eventCode;
    @Column(name = "event_name")
    private String eventName;
    @Column(name = "project_cust_code")
    private String projectCustCode;
    @Column(name = "project_name")
    private String projectName;
    @Column(name = "counterparty_type")
    private String counterPartyType;
    @Column(name = "counterparty_cust_code")
    private String counterPartyCustCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "transaction_id", referencedColumnName = "id")
    private TransactionEntity transaction;
}
