package org.cardanofoundation.reeve.indexer.model.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reeve_currency")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class CurrencyEntity {

    @EmbeddedId
    @AttributeOverrides({
            @AttributeOverride(name = "orgId", column = @Column(name = "organisation_id")),
            @AttributeOverride(name = "currencyId", column = @Column(name = "currency_id")),
    })
    private Id id;

    private String custCode;


    @Embeddable
    @AllArgsConstructor
    @NoArgsConstructor
    @Getter
    @Setter
    @EqualsAndHashCode
    public static class Id {
        private String orgId;
        private String currencyId;
    }

}
