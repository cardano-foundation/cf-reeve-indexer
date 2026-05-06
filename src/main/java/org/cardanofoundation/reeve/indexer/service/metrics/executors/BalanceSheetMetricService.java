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
import org.cardanofoundation.reeve.indexer.util.ReportFieldParser;

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

                Map<String, Object> liabilities = ReportFieldParser.getNestedSection(fieldsMap, "liabilities");
                if (liabilities != null) {
                    Map<String, Object> currentLiabilities = ReportFieldParser.getNestedSection(liabilities,
                            "current_liabilities");
                    if (currentLiabilities != null) {
                        String tradeAccountsPayables = ReportFieldParser.getNestedFieldValue(currentLiabilities,
                                "trade_accounts_payables");
                        if (tradeAccountsPayables != null) {
                            totalLiabilities[0] = totalLiabilities[0].add(new BigDecimal(tradeAccountsPayables));
                        }
                        String otherShortTermLiabilities = ReportFieldParser.getNestedFieldValue(currentLiabilities,
                                "other_short_term_liabilities");
                        if (otherShortTermLiabilities != null) {
                            totalLiabilities[0] = totalLiabilities[0].add(new BigDecimal(otherShortTermLiabilities));
                        }
                        String accrualsAndShortTermProvisions = ReportFieldParser.getNestedFieldValue(
                                currentLiabilities, "accruals_and_short_term_provisions");
                        if (accrualsAndShortTermProvisions != null) {
                            totalLiabilities[0] = totalLiabilities[0]
                                    .add(new BigDecimal(accrualsAndShortTermProvisions));
                        }
                    }
                    Map<String, Object> nonCurrentLiabilities = ReportFieldParser.getNestedSection(liabilities,
                            "non_current_liabilities");
                    if (nonCurrentLiabilities != null) {
                        String provisions = ReportFieldParser.getNestedFieldValue(nonCurrentLiabilities,
                                "provisions");
                        if (provisions != null) {
                            totalLiabilities[0] = totalLiabilities[0].add(new BigDecimal(provisions));
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

                Map<String, Object> assets = ReportFieldParser.getNestedSection(fieldsMap, "assets");
                if (assets != null) {
                    Map<String, Object> currentAssets = ReportFieldParser.getNestedSection(assets,
                            "current_assets");
                    if (currentAssets != null) {
                        String cryptoAssets = ReportFieldParser.getNestedFieldValue(currentAssets, "crypto_assets");
                        if (cryptoAssets != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(cryptoAssets));
                        }
                        String cashAndCashEquivalents = ReportFieldParser.getNestedFieldValue(currentAssets,
                                "cash_and_cash_equivalents");
                        if (cashAndCashEquivalents != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(cashAndCashEquivalents));
                        }
                        String otherReceivables = ReportFieldParser.getNestedFieldValue(currentAssets,
                                "other_receivables");
                        if (otherReceivables != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(otherReceivables));
                        }
                        String prepaymentsAndOtherShortTermAssets = ReportFieldParser.getNestedFieldValue(
                                currentAssets, "prepayments_and_other_short_term_assets");
                        if (prepaymentsAndOtherShortTermAssets != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(prepaymentsAndOtherShortTermAssets));
                        }
                    }
                    Map<String, Object> nonCurrentAssets = ReportFieldParser.getNestedSection(assets,
                            "non_current_assets");
                    if (nonCurrentAssets != null) {
                        String financialAssets = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "financial_assets");
                        if (financialAssets != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(financialAssets));
                        }
                        String intangibleAssets = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "intangible_assets");
                        if (intangibleAssets != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(intangibleAssets));
                        }
                        String tangibleAssets = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "tangible_assets");
                        if (tangibleAssets != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(tangibleAssets));
                        }
                        String investments = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "investments");
                        if (investments != null) {
                            totalAssets[0] = totalAssets[0].add(new BigDecimal(investments));
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

                Map<String, Object> assets = ReportFieldParser.getNestedSection(fieldsMap, "assets");
                if (assets != null) {
                    Map<String, Object> currentAssets = ReportFieldParser.getNestedSection(assets,
                            "current_assets");
                    if (currentAssets != null) {
                        String cash = ReportFieldParser.getNestedFieldValue(currentAssets,
                                "cash_and_cash_equivalents");
                        if (cash != null) {
                            assetCategories.merge(BalanceSheetCategories.CASH, new BigDecimal(cash), BigDecimal::add);
                        }
                        String cryptoAssets = ReportFieldParser.getNestedFieldValue(currentAssets,
                                "crypto_assets");
                        if (cryptoAssets != null) {
                            assetCategories.merge(BalanceSheetCategories.CRYPTO_ASSETS, new BigDecimal(cryptoAssets),
                                    BigDecimal::add);
                        }
                        String otherReceivables = ReportFieldParser.getNestedFieldValue(currentAssets,
                                "other_receivables");
                        if (otherReceivables != null) {
                            assetCategories.merge(BalanceSheetCategories.OTHER, new BigDecimal(otherReceivables),
                                    BigDecimal::add);
                        }
                        String prepayments = ReportFieldParser.getNestedFieldValue(currentAssets,
                                "prepayments_and_other_short_term_assets");
                        if (prepayments != null) {
                            assetCategories.merge(BalanceSheetCategories.OTHER, new BigDecimal(prepayments),
                                    BigDecimal::add);
                        }
                    }
                    Map<String, Object> nonCurrentAssets = ReportFieldParser.getNestedSection(assets,
                            "non_current_assets");
                    if (nonCurrentAssets != null) {
                        String financialAssets = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "financial_assets");
                        if (financialAssets != null) {
                            assetCategories.merge(BalanceSheetCategories.FINANCIAL_ASSETS,
                                    new BigDecimal(financialAssets), BigDecimal::add);
                        }
                        String intangibleAssets = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "intangible_assets");
                        if (intangibleAssets != null) {
                            assetCategories.merge(BalanceSheetCategories.OTHER, new BigDecimal(intangibleAssets),
                                    BigDecimal::add);
                        }
                        String investments = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "investments");
                        if (investments != null) {
                            assetCategories.merge(BalanceSheetCategories.OTHER, new BigDecimal(investments),
                                    BigDecimal::add);
                        }
                        String tangibleAssets = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "tangible_assets");
                        if (tangibleAssets != null) {
                            assetCategories.merge(BalanceSheetCategories.OTHER, new BigDecimal(tangibleAssets),
                                    BigDecimal::add);
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
                Map<String, Object> assets = ReportFieldParser.getNestedSection(fieldsMap, "assets");
                if (assets != null) {
                    Map<String, Object> currentAssets = ReportFieldParser.getNestedSection(assets,
                            "current_assets");
                    if (currentAssets != null) {
                        String cryptoAssets = ReportFieldParser.getNestedFieldValue(currentAssets,
                                "crypto_assets");
                        if (cryptoAssets != null) {
                            assetMap.merge(BalanceSheetCategories.CRYPTO_ASSETS, new BigDecimal(cryptoAssets),
                                    BigDecimal::add);
                        }
                        String cash = ReportFieldParser.getNestedFieldValue(currentAssets,
                                "cash_and_cash_equivalents");
                        if (cash != null) {
                            assetMap.merge(BalanceSheetCategories.CASH, new BigDecimal(cash), BigDecimal::add);
                        }
                        String otherReceivables = ReportFieldParser.getNestedFieldValue(currentAssets,
                                "other_receivables");
                        if (otherReceivables != null) {
                            assetMap.merge(BalanceSheetCategories.OTHER, new BigDecimal(otherReceivables),
                                    BigDecimal::add);
                        }
                        String prepayments = ReportFieldParser.getNestedFieldValue(currentAssets,
                                "prepayments_and_other_short_term_assets");
                        if (prepayments != null) {
                            assetMap.merge(BalanceSheetCategories.PREPAYMENTS, new BigDecimal(prepayments),
                                    BigDecimal::add);
                        }
                    }
                    Map<String, Object> nonCurrentAssets = ReportFieldParser.getNestedSection(assets,
                            "non_current_assets");
                    if (nonCurrentAssets != null) {
                        String financialAssets = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "financial_assets");
                        if (financialAssets != null) {
                            assetMap.merge(BalanceSheetCategories.FINANCIAL_ASSETS, new BigDecimal(financialAssets),
                                    BigDecimal::add);
                        }
                        String intangibleAssets = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "intangible_assets");
                        if (intangibleAssets != null) {
                            assetMap.merge(BalanceSheetCategories.INTANGIBLE_ASSETS, new BigDecimal(intangibleAssets),
                                    BigDecimal::add);
                        }
                        String investments = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "investments");
                        if (investments != null) {
                            assetMap.merge(BalanceSheetCategories.INVESTMENTS, new BigDecimal(investments),
                                    BigDecimal::add);
                        }
                        String tangibleAssets = ReportFieldParser.getNestedFieldValue(nonCurrentAssets,
                                "tangible_assets");
                        if (tangibleAssets != null) {
                            assetMap.merge(BalanceSheetCategories.PROPERTY_PLANT_EQUIPMENT,
                                    new BigDecimal(tangibleAssets), BigDecimal::add);
                        }
                    }
                }
                balanceSheetOverview.put(BalanceSheetCategories.ASSETS, assetMap);

                // Liabilities
                Map<BalanceSheetCategories, BigDecimal> liabilityMap = new HashMap<>();
                Map<String, Object> liabilities = ReportFieldParser.getNestedSection(fieldsMap, "liabilities");
                if (liabilities != null) {
                    Map<String, Object> currentLiabilities = ReportFieldParser.getNestedSection(liabilities,
                            "current_liabilities");
                    if (currentLiabilities != null) {
                        String accruals = ReportFieldParser.getNestedFieldValue(currentLiabilities,
                                "accruals_and_short_term_provisions");
                        if (accruals != null) {
                            liabilityMap.merge(BalanceSheetCategories.ACCRUSAL_AND_SHORT_TERM_PROVISIONS,
                                    new BigDecimal(accruals), BigDecimal::add);
                        }
                        String tradeAccountsPayables = ReportFieldParser.getNestedFieldValue(currentLiabilities,
                                "trade_accounts_payables");
                        if (tradeAccountsPayables != null) {
                            liabilityMap.merge(BalanceSheetCategories.TRADE_ACCOUNTS_PAYABLE,
                                    new BigDecimal(tradeAccountsPayables), BigDecimal::add);
                        }
                        String otherCurrentLiabilities = ReportFieldParser.getNestedFieldValue(currentLiabilities,
                                "other_short_term_liabilities");
                        if (otherCurrentLiabilities != null) {
                            liabilityMap.merge(BalanceSheetCategories.OTHER, new BigDecimal(otherCurrentLiabilities),
                                    BigDecimal::add);
                        }
                    }
                    Map<String, Object> nonCurrentLiabilities = ReportFieldParser.getNestedSection(liabilities,
                            "non_current_liabilities");
                    if (nonCurrentLiabilities != null) {
                        String provisions = ReportFieldParser.getNestedFieldValue(nonCurrentLiabilities,
                                "provisions");
                        if (provisions != null) {
                            liabilityMap.merge(BalanceSheetCategories.PROVISIONS, new BigDecimal(provisions),
                                    BigDecimal::add);
                        }
                    }
                }

                // Capital
                Map<String, Object> capital = ReportFieldParser.getNestedSection(fieldsMap, "capital");
                if (capital != null) {
                    String capitalValue = ReportFieldParser.getNestedFieldValue(capital, "capital");
                    if (capitalValue != null) {
                        liabilityMap.merge(BalanceSheetCategories.CAPITAL, new BigDecimal(capitalValue),
                                BigDecimal::add);
                    }
                    String profitForTheYear = ReportFieldParser.getNestedFieldValue(capital,
                            "profit_for_the_year");
                    if (profitForTheYear != null) {
                        liabilityMap.merge(BalanceSheetCategories.PROFIT_OF_THE_YEAR, new BigDecimal(profitForTheYear),
                                BigDecimal::add);
                    }
                    String resultsCarriedForward = ReportFieldParser.getNestedFieldValue(capital,
                            "results_carried_forward");
                    if (resultsCarriedForward != null) {
                        liabilityMap.merge(BalanceSheetCategories.RESULTS_CARRIED_FORWARD,
                                new BigDecimal(resultsCarriedForward), BigDecimal::add);
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
