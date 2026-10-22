package org.cardanofoundation.reeve.indexer.model.view.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * Landing-page roll-up of everything the indexer has published on-chain: transactions, reports and
 * FUNDING events. Either organisation-wide or across every organisation. Monetary amounts are never
 * FX-normalised; funding totals are therefore reported per currency and the monthly funding series
 * is restricted to {@link FundingOverview#primaryCurrency} (the currency with the most funding).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardOverviewView {

    private String organisationId;
    private long organisationCount;

    private TransactionOverview transactions;
    private ReportOverview reports;
    private FundingOverview funding;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TransactionOverview {
        private long total;
        private long itemCount;
        private long batchCount;
        private long projectCount;
        private long counterpartyCount;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate firstDate;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate lastDate;
        private List<LabelCount> byType;
        private List<MonthCount> monthly;
        private List<RecentTransaction> recent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ReportOverview {
        /** Distinct (organisation, subType, interval, year, period) reports: versions and signers collapsed. */
        private long total;
        /** Every on-chain publication, including superseded versions and one per signing identity. */
        private long publications;
        /** Reports with at least one certificate (a verified identity signed one of its submissions). */
        private long verified;
        /** Certificates over all reports: one per verified identity that signed a report. */
        private long certificates;
        private List<LabelCount> bySubType;
        private List<LabelCount> byInterval;
        private List<LabelCount> byYear;
        private List<RecentReport> recent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FundingOverview {
        private long eventCount;
        private long projectCount;
        private long fundingRoundCount;
        private String primaryCurrency;
        private List<CurrencyTotals> totals;
        private List<LabelCount> byType;
        private List<MonthAmounts> monthly;
        private List<RecentEvent> recent;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class LabelCount {
        private String label;
        private long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class MonthCount {
        /** {@code yyyy-MM} */
        private String month;
        private long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class MonthAmounts {
        /** {@code yyyy-MM} */
        private String month;
        private BigDecimal funded;
        private BigDecimal spent;
        private BigDecimal refunded;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class CurrencyTotals {
        private String currency;
        private BigDecimal funded;
        private BigDecimal spent;
        private BigDecimal refunded;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class RecentTransaction {
        private String id;
        private String txHash;
        private String internalNumber;
        private String type;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate date;
        private String organisationId;
        private String organisationName;
        private long itemCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class RecentReport {
        private String txHash;
        private String subType;
        private String interval;
        private Integer year;
        private Integer period;
        private Long ver;
        private boolean identityVerified;
        private String organisationId;
        private String organisationName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
    public static class RecentEvent {
        private Long id;
        private String txHash;
        private String eventId;
        private String eventType;
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
        private LocalDate date;
        private BigDecimal totalAmount;
        private String currency;
        private String counterparty;
        private String organisationId;
        private String organisationName;
    }
}
