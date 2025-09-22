package org.cardanofoundation.reeve.indexer.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import org.cardanofoundation.reeve.indexer.model.domain.Interval;

@Entity
@Table(name = "reeve_reports")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ReportEntity {
    @Id
    @GeneratedValue
    private Long id;

    private String txHash;

    // Assuming Interval is an Enum. Use @Embedded for a separate class.
    @Enumerated(EnumType.STRING)
    private Interval interval;

    private Integer year;

    private Integer period;

    private String subType;

    private Long ver;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String fields;

    @Column(name = "organisation_id", nullable = false)
    private String organisationId;

    private boolean identityVerified;

    private String metadataHash;
}
