// All parsing of string values to numbers is now done using BigDecimal throughout the file.

package org.cardanofoundation.reeve.indexer.service.metrics.executors;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.domain.BalanceSheetCategories;
import org.cardanofoundation.reeve.indexer.model.domain.MetricEnum;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;
import org.cardanofoundation.reeve.indexer.service.ReportService;
import org.cardanofoundation.reeve.indexer.service.metrics.MetricExecutor;

@Component
@RequiredArgsConstructor
@Slf4j
public class BalanceSheetMetricService extends MetricExecutor {

    private final ReportService reportService;

    @PostConstruct
    public void init() {
        name = MetricEnum.BALANCE_SHEET;
        metrics = Map.of(
            MetricEnum.SubMetric.ASSET_CATEGORIES, this::getAssetCategories,
            MetricEnum.SubMetric.BALANCE_SHEET_OVERVIEW, this::getBalanceSheetOverview,
            MetricEnum.SubMetric.TOTAL_ASSETS, this::getTotalAssets,
            MetricEnum.SubMetric.TOTAL_LIABILITIES, this::getTotalLiabilities
        );
    }

    private Object getTotalLiabilities(String organisationID, Optional<LocalDate> startDate,
            Optional<LocalDate> endDate) {
        Set<ReportEntity> reportEntities = reportService.findReportsInDateRange(organisationID,
                MetricEnum.BALANCE_SHEET.name(), startDate, endDate);

        final BigDecimal[] totalLiabilities = { BigDecimal.ZERO };
        Optional<ReportEntity> maxEntityO = reportService.getMostRecentReport(reportEntities);
        if (maxEntityO.isEmpty()) {
            return totalLiabilities[0];
        }

        String fieldsJson = maxEntityO.get().getFields();
        if (fieldsJson != null && !fieldsJson.isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> fieldsMap = mapper.readValue(fieldsJson, Map.class);

                Map<String, Object> liabilities = (Map<String, Object>) fieldsMap.get("liabilities");
                if (liabilities != null) {
                    Map<String, Object> currentLiabilities = (Map<String, Object>) liabilities
                            .get("current_liabilities");
                    if (currentLiabilities != null) {
                        Object tradeAccountsPayables = currentLiabilities.get("trade_accounts_payables");
                        if (tradeAccountsPayables != null) {
                            totalLiabilities[0] = totalLiabilities[0]
                                    .add(new BigDecimal(tradeAccountsPayables.toString()));
                        }
                        Object otherShortTermLiabilities = currentLiabilities.get("other_short_term_liabilities");
                        if (otherShortTermLiabilities != null) {
                            totalLiabilities[0] = totalLiabilities[0]
                                    .add(new BigDecimal(otherShortTermLiabilities.toString()));
                        }
                        Object accrualsAndShortTermProvisions = currentLiabilities
                                .get("accruals_and_short_term_provisions");
                        if (accrualsAndShortTermProvisions != null) {
                            totalLiabilities[0] = totalLiabilities[0]
                                    .add(new BigDecimal(accrualsAndShortTermProvisions.toString()));
                        }
                    }
                    Map<String, Object> nonCurrentLiabilities = (Map<String, Object>) liabilities
                            .get("non_current_liabilities");
                    if (nonCurrentLiabilities != null) {
                        Object provisions = nonCurrentLiabilities.get("provisions");
                        if (provisions != null) {
                            totalLiabilities[0] = totalLiabilities[0].add(new BigDecimal(provisions.toString()));
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error parsing balance sheet fields JSON", e);
            }
        }
        return totalLiabilities[0];
    }

    private Object getTotalAssets(String organisationID, Optional<LocalDate> startDate, Optional<LocalDate> endDate) {
        Set<ReportEntity> reportEntities = reportService.findReportsInDateRange(organisationID,
                MetricEnum.BALANCE_SHEET.name(), startDate, endDate);

        final BigDecimal[] totalAssets = { BigDecimal.ZERO };
        Optional<ReportEntity> maxEntityO = reportService.getMostRecentReport(reportEntities);
        if (maxEntityO.isEmpty()) {
            return totalAssets[0];
        }
        String fieldsJson = maxEntityO.get().getFields();
        if (fieldsJson != null && !fieldsJson.isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> fieldsMap = mapper.readValue(fieldsJson, Map.class);

                Map<String, Object> assets = (Map<String, Object>) fieldsMap.get("assets");
                if (assets != null) {
                    Map<String, Object> currentAssets = (Map<String, Object>) assets.get("current_assets");
                    if (currentAssets != null) {
                        Object cryptoAssets = currentAssets.get("crypto_assets");
                        if (cryptoAssets != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(cryptoAssets.toString()));
                        }
                        Object cashAndCashEquivalents = currentAssets.get("cash_and_cash_equivalents");
                        if (cashAndCashEquivalents != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(cashAndCashEquivalents.toString()));
                        }
                        Object otherReceivables = currentAssets.get("other_receivables");
                        if (otherReceivables != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(otherReceivables.toString()));
                        }
                        Object prepaymentsAndOtherShortTermAssets = currentAssets.get("prepayments_and_other_short_term_assets");
                        if (prepaymentsAndOtherShortTermAssets != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(prepaymentsAndOtherShortTermAssets.toString()));
                        }
                    }
                    Map<String, Object> nonCurrentAssets = (Map<String, Object>) assets.get("non_current_assets");
                    if (nonCurrentAssets != null) {
                        Object financialAssets = nonCurrentAssets.get("financial_assets");
                        if (financialAssets != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(financialAssets.toString()));
                        }
                        Object intangibleAssets = nonCurrentAssets.get("intangible_assets");
                        if (intangibleAssets != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(intangibleAssets.toString()));
                        }
                        Object tangibleAssets = nonCurrentAssets.get("tangible_assets");
                        if (tangibleAssets != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(tangibleAssets.toString()));
                        }
                        Object investments = nonCurrentAssets.get("investments");
                        if (investments != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(investments.toString()));
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error parsing balance sheet fields JSON", e);
            }
        }
        return totalAssets[0];
    }

    private Object getAssetCategories(String organisationID, Optional<LocalDate> startDate, Optional<LocalDate> endDate) {
        Set<ReportEntity> reportEntities = reportService.findReportsInDateRange(organisationID,
                MetricEnum.BALANCE_SHEET.name(), startDate, endDate);

        Map<BalanceSheetCategories, BigDecimal> assetCategories = new EnumMap<>(BalanceSheetCategories.class);

        Optional<ReportEntity> maxEntityO = reportService.getMostRecentReport(reportEntities);
        if (maxEntityO.isEmpty()) {
            return assetCategories;
        }

        String fieldsJson = maxEntityO.get().getFields();
        if (fieldsJson != null && !fieldsJson.isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> fieldsMap = mapper.readValue(fieldsJson, Map.class);

                Map<String, Object> assets = (Map<String, Object>) fieldsMap.get("assets");
                if (assets != null) {
                    Map<String, Object> currentAssets = (Map<String, Object>) assets.get("current_assets");
                    if (currentAssets != null) {
                        Object cash = currentAssets.get("cash_and_cash_equivalents");
                        if (cash != null) {
                            assetCategories.merge(BalanceSheetCategories.CASH, new BigDecimal(cash.toString()), BigDecimal::add);
                        }
                        Object cryptoAssets = currentAssets.get("crypto_assets");
                        if (cryptoAssets != null) {
                            assetCategories.merge(BalanceSheetCategories.CRYPTO_ASSETS, new BigDecimal(cryptoAssets.toString()), BigDecimal::add);
                        }
                        Object otherReceivables = currentAssets.get("other_receivables");
                        if (otherReceivables != null) {
                            assetCategories.merge(BalanceSheetCategories.OTHER, new BigDecimal(otherReceivables.toString()), BigDecimal::add);
                        }
                        Object prepayments = currentAssets.get("prepayments_and_other_short_term_assets");
                        if (prepayments != null) {
                            assetCategories.merge(BalanceSheetCategories.OTHER, new BigDecimal(prepayments.toString()), BigDecimal::add);
                        }
                    }
                    Map<String, Object> nonCurrentAssets = (Map<String, Object>) assets.get("non_current_assets");
                    if (nonCurrentAssets != null) {
                        Object financialAssets = nonCurrentAssets.get("financial_assets");
                        if (financialAssets != null) {
                            assetCategories.merge(BalanceSheetCategories.FINANCIAL_ASSETS, new BigDecimal(financialAssets.toString()), BigDecimal::add);
                        }
                        Object intangibleAssets = nonCurrentAssets.get("intangible_assets");
                        if (intangibleAssets != null) {
                            assetCategories.merge(BalanceSheetCategories.OTHER, new BigDecimal(intangibleAssets.toString()), BigDecimal::add);
                        }
                        Object investments = nonCurrentAssets.get("investments");
                        if (investments != null) {
                            assetCategories.merge(BalanceSheetCategories.OTHER, new BigDecimal(investments.toString()), BigDecimal::add);
                        }
                        Object tangibleAssets = nonCurrentAssets.get("tangible_assets");
                        if (tangibleAssets != null) {
                            assetCategories.merge(BalanceSheetCategories.OTHER, new BigDecimal(tangibleAssets.toString()), BigDecimal::add);
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error parsing asset categories fields JSON", e);
            }
        }
        return assetCategories;
    }

    private Object getBalanceSheetOverview(String organisationID, Optional<LocalDate> startDate, Optional<LocalDate> endDate) {
        Set<ReportEntity> reportEntities = reportService.findReportsInDateRange(organisationID,
                MetricEnum.BALANCE_SHEET.name(), startDate, endDate);

        Map<BalanceSheetCategories, Map<BalanceSheetCategories, BigDecimal>> balanceSheetOverview = new EnumMap<>(BalanceSheetCategories.class);

        Optional<ReportEntity> maxEntityO = reportService.getMostRecentReport(reportEntities);
        if (maxEntityO.isEmpty()) {
            return balanceSheetOverview;
        }

        String fieldsJson = maxEntityO.get().getFields();
        if (fieldsJson != null && !fieldsJson.isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> fieldsMap = mapper.readValue(fieldsJson, Map.class);

                // Assets
                Map<BalanceSheetCategories, BigDecimal> assetMap = new HashMap<>();
                Map<String, Object> assets = (Map<String, Object>) fieldsMap.get("assets");
                if (assets != null) {
                    Map<String, Object> currentAssets = (Map<String, Object>) assets.get("current_assets");
                    if (currentAssets != null) {
                        Object cryptoAssets = currentAssets.get("crypto_assets");
                        if (cryptoAssets != null) {
                            assetMap.merge(BalanceSheetCategories.CRYPTO_ASSETS, new BigDecimal(cryptoAssets.toString()), BigDecimal::add);
                        }
                        Object cash = currentAssets.get("cash_and_cash_equivalents");
                        if (cash != null) {
                            assetMap.merge(BalanceSheetCategories.CASH, new BigDecimal(cash.toString()), BigDecimal::add);
                        }
                        Object otherReceivables = currentAssets.get("other_receivables");
                        if (otherReceivables != null) {
                            assetMap.merge(BalanceSheetCategories.OTHER, new BigDecimal(otherReceivables.toString()), BigDecimal::add);
                        }
                        Object prepayments = currentAssets.get("prepayments_and_other_short_term_assets");
                        if (prepayments != null) {
                            assetMap.merge(BalanceSheetCategories.PREPAYMENTS, new BigDecimal(prepayments.toString()), BigDecimal::add);
                        }
                    }
                    Map<String, Object> nonCurrentAssets = (Map<String, Object>) assets.get("non_current_assets");
                    if (nonCurrentAssets != null) {
                        Object financialAssets = nonCurrentAssets.get("financial_assets");
                        if (financialAssets != null) {
                            assetMap.merge(BalanceSheetCategories.FINANCIAL_ASSETS, new BigDecimal(financialAssets.toString()), BigDecimal::add);
                        }
                        Object intangibleAssets = nonCurrentAssets.get("intangible_assets");
                        if (intangibleAssets != null) {
                            assetMap.merge(BalanceSheetCategories.INTANGIBLE_ASSETS, new BigDecimal(intangibleAssets.toString()), BigDecimal::add);
                        }
                        Object investments = nonCurrentAssets.get("investments");
                        if (investments != null) {
                            assetMap.merge(BalanceSheetCategories.INVESTMENTS, new BigDecimal(investments.toString()), BigDecimal::add);
                        }
                        Object tangibleAssets = nonCurrentAssets.get("tangible_assets");
                        if (tangibleAssets != null) {
                            assetMap.merge(BalanceSheetCategories.PROPERTY_PLANT_EQUIPMENT, new BigDecimal(tangibleAssets.toString()), BigDecimal::add);
                        }
                    }
                }
                balanceSheetOverview.put(BalanceSheetCategories.ASSETS, assetMap);

                // Liabilities
                Map<BalanceSheetCategories, BigDecimal> liabilityMap = new HashMap<>();
                Map<String, Object> liabilities = (Map<String, Object>) fieldsMap.get("liabilities");
                if (liabilities != null) {
                    Map<String, Object> currentLiabilities = (Map<String, Object>) liabilities.get("current_liabilities");
                    if (currentLiabilities != null) {
                        Object accruals = currentLiabilities.get("accruals_and_short_term_provisions");
                        if (accruals != null) {
                            liabilityMap.merge(BalanceSheetCategories.ACCRUSAL_AND_SHORT_TERM_PROVISIONS, new BigDecimal(accruals.toString()), BigDecimal::add);
                        }
                        Object tradeAccountsPayables = currentLiabilities.get("trade_accounts_payables");
                        if (tradeAccountsPayables != null) {
                            liabilityMap.merge(BalanceSheetCategories.TRADE_ACCOUNTS_PAYABLE, new BigDecimal(tradeAccountsPayables.toString()), BigDecimal::add);
                        }
                        Object otherCurrentLiabilities = currentLiabilities.get("other_short_term_liabilities");
                        if (otherCurrentLiabilities != null) {
                            liabilityMap.merge(BalanceSheetCategories.OTHER, new BigDecimal(otherCurrentLiabilities.toString()), BigDecimal::add);
                        }
                    }
                    Map<String, Object> nonCurrentLiabilities = (Map<String, Object>) liabilities.get("non_current_liabilities");
                    if (nonCurrentLiabilities != null) {
                        Object provisions = nonCurrentLiabilities.get("provisions");
                        if (provisions != null) {
                            liabilityMap.merge(BalanceSheetCategories.PROVISIONS, new BigDecimal(provisions.toString()), BigDecimal::add);
                        }
                    }
                }

                // Capital
                Map<String, Object> capital = (Map<String, Object>) fieldsMap.get("capital");
                if (capital != null) {
                    Object capitalValue = capital.get("capital");
                    if (capitalValue != null) {
                        liabilityMap.merge(BalanceSheetCategories.CAPITAL, new BigDecimal(capitalValue.toString()), BigDecimal::add);
                    }
                    Object profitForTheYear = capital.get("profit_for_the_year");
                    if (profitForTheYear != null) {
                        liabilityMap.merge(BalanceSheetCategories.PROFIT_OF_THE_YEAR, new BigDecimal(profitForTheYear.toString()), BigDecimal::add);
                    }
                    Object resultsCarriedForward = capital.get("results_carried_forward");
                    if (resultsCarriedForward != null) {
                        liabilityMap.merge(BalanceSheetCategories.RESULTS_CARRIED_FORWARD, new BigDecimal(resultsCarriedForward.toString()), BigDecimal::add);
                    }
                }
                balanceSheetOverview.put(BalanceSheetCategories.LIABILITIES, liabilityMap);

            } catch (Exception e) {
                log.error("Error parsing balance sheet overview fields JSON", e);
            }
        }
        return balanceSheetOverview;
    }

}
