package org.cardanofoundation.reeve.indexer.model.domain;

public enum MetricEnum {

    BALANCE_SHEET,
    INCOME_STATEMENT;

    public enum SubMetric {
        ASSET_CATEGORIES,
        BALANCE_SHEET_OVERVIEW,
        TOTAL_EXPENSES,
        INCOME_STREAMS,
        TOTAL_ASSETS,
        TOTAL_LIABILITIES,
        PROFIT_OF_THE_YEAR,
    }

}