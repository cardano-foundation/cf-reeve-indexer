package org.cardanofoundation.reeve.indexer.service.metrics.executors;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.domain.IncomeStatemenCategories;
import org.cardanofoundation.reeve.indexer.model.domain.MetricEnum;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;
import org.cardanofoundation.reeve.indexer.service.ReportService;
import org.cardanofoundation.reeve.indexer.service.metrics.MetricExecutor;
import org.cardanofoundation.reeve.indexer.util.ReportFieldParser;

@Slf4j
@RequiredArgsConstructor
@Component
public class IncomeStatementMetricService extends MetricExecutor {

    private final ReportService reportService;

    @PostConstruct
    public void init() {
        name = MetricEnum.INCOME_STATEMENT;
        metrics = Map.of(
                MetricEnum.SubMetric.TOTAL_EXPENSES, this::getTotalExpenses,
                MetricEnum.SubMetric.INCOME_STREAMS, this::getIncomeStream,
                MetricEnum.SubMetric.PROFIT_OF_THE_YEAR, this::getProfitOfTheYear);
    }

    private Map<Integer, Object> getProfitOfTheYear(String organisationID, Optional<LocalDate> startDate,
            Optional<LocalDate> endDate) {
        Set<ReportEntity> reportEntities = reportService.findReportsInDateRange(organisationID,
                MetricEnum.INCOME_STATEMENT.name(), startDate, endDate);

        return reportEntities.stream()
        .collect(Collectors.groupingBy(ReportEntity::getYear, Collectors.collectingAndThen(
            Collectors.maxBy(Comparator.comparing(o ->
                reportService.getReportEndDate(o.getInterval(),
                reportService.getReportStartDate(o.getInterval(), o.getPeriod(), o.getYear())))),
                maxReportOpt -> maxReportOpt.flatMap(t -> {
                    ObjectMapper objectMapper = new ObjectMapper();
                    Map<String, Object> fieldsMap;
                    try {
                        fieldsMap = objectMapper.readValue(t.getFields(), Map.class);
                    } catch (JsonProcessingException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                        return Optional.empty();
                    }
                    String profitForTheYearString = ReportFieldParser.getNestedFieldValue(fieldsMap,
                            "profit_for_the_year");
                    if (profitForTheYearString != null) {
                        return Optional.of(new BigDecimal(profitForTheYearString).doubleValue());
                    } else {
                        return Optional.of(0.0);
                    }
                })))
        );
    }

    private Map<IncomeStatemenCategories, Integer> getTotalExpenses(String organisationID,
            Optional<LocalDate> startDate, Optional<LocalDate> endDate) {
        Set<ReportEntity> reportEntities = reportService.findReportsInDateRange(organisationID,
                MetricEnum.INCOME_STATEMENT.name(), startDate, endDate);

        Map<IncomeStatemenCategories, Integer> totalExpenses = new EnumMap<>(IncomeStatemenCategories.class);
        Optional<ReportEntity> maxEntityO = reportService.getMostRecentReport(reportEntities);
        if (maxEntityO.isEmpty()) {
            return totalExpenses;
        }
        ReportEntity maxEntity = maxEntityO.get();
        String fieldsJson = maxEntity.getFields();
        if (fieldsJson != null && !fieldsJson.isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                Map<String, Object> fieldsMap = objectMapper.readValue(fieldsJson, Map.class);

                Map<String, Object> costOfGoodsAndServices = ReportFieldParser.getNestedSection(fieldsMap,
                        "cost_of_goods_and_services");
                if (costOfGoodsAndServices != null) {
                    String externalServices = ReportFieldParser.getNestedFieldValue(costOfGoodsAndServices,
                            "external_services");
                    if (externalServices != null) {
                        BigDecimal externalServicesValue = new BigDecimal(externalServices);
                        totalExpenses.merge(IncomeStatemenCategories.COST_OF_SERVICE, externalServicesValue.intValue(),
                                Integer::sum);
                    }
                }

                Map<String, Object> operatingExpenses = ReportFieldParser.getNestedSection(fieldsMap,
                        "operating_expenses");
                if (operatingExpenses != null) {
                    String personnelExpenses = ReportFieldParser.getNestedFieldValue(operatingExpenses,
                            "personnel_expenses");
                    if (personnelExpenses != null) {
                        BigDecimal personnelExpensesValue = new BigDecimal(personnelExpenses);
                        totalExpenses.merge(IncomeStatemenCategories.PERSONNEL_EXPENSES, personnelExpensesValue.intValue(),
                                Integer::sum);
                    }
                    int financialExpenses = 0;
                    String generalAndAdministrative = ReportFieldParser.getNestedFieldValue(operatingExpenses,
                            "general_and_administrative_expenses");
                    if (generalAndAdministrative != null) {
                        financialExpenses += new BigDecimal(generalAndAdministrative).intValue();
                    }
                    String amortizationIntangible = ReportFieldParser.getNestedFieldValue(operatingExpenses,
                            "amortization_on_intangible_assets");
                    if (amortizationIntangible != null) {
                        financialExpenses += new BigDecimal(amortizationIntangible).intValue();
                    }
                    String depreciation = ReportFieldParser.getNestedFieldValue(operatingExpenses,
                            "depreciation_and_impairment_losses_on_tangible_assets");
                    if (depreciation != null) {
                        financialExpenses += new BigDecimal(depreciation).intValue();
                    }
                    String rentExpenses = ReportFieldParser.getNestedFieldValue(operatingExpenses,
                            "rent_expenses");
                    if (rentExpenses != null) {
                        financialExpenses += new BigDecimal(rentExpenses).intValue();
                    }
                    totalExpenses.merge(IncomeStatemenCategories.FINANCIAL_EXPENSES, financialExpenses, Integer::sum);
                }

                Map<String, Object> financialIncome = ReportFieldParser.getNestedSection(fieldsMap,
                        "financial_income");
                if (financialIncome != null) {
                    String financialExpenses = ReportFieldParser.getNestedFieldValue(financialIncome,
                            "financial_expenses");
                    if (financialExpenses != null) {
                        BigDecimal financialExpensesValue = new BigDecimal(financialExpenses);
                        totalExpenses.merge(IncomeStatemenCategories.TAX_EXPENSES, financialExpensesValue.intValue(),
                                Integer::sum);
                    }
                }

                Map<String, Object> taxExpenses = ReportFieldParser.getNestedSection(fieldsMap, "tax_expenses");
                if (taxExpenses != null) {
                    String directTaxes = ReportFieldParser.getNestedFieldValue(taxExpenses, "direct_taxes");
                    if (directTaxes != null) {
                        BigDecimal directTaxesValue = new BigDecimal(directTaxes);
                        totalExpenses.merge(IncomeStatemenCategories.OTHER_OPERATING_EXPENSES, directTaxesValue.intValue(),
                                Integer::sum);
                    }
                }
            } catch (Exception e) {
                log.error("Error parsing income statement fields JSON", e);
            }
        }
        return totalExpenses;
    }

    private Map<IncomeStatemenCategories, Double> getIncomeStream(String organisationID, Optional<LocalDate> startDate,
            Optional<LocalDate> endDate) {
        Set<ReportEntity> reportEntities = reportService.findReportsInDateRange(organisationID,
                MetricEnum.INCOME_STATEMENT.name(), startDate, endDate);

        Map<IncomeStatemenCategories, Double> incomeStream = new EnumMap<>(IncomeStatemenCategories.class);
        Optional<ReportEntity> maxEntityO = reportService.getMostRecentReport(reportEntities);
        if (maxEntityO.isEmpty()) {
            return incomeStream;
        }
        ReportEntity maxEntity = maxEntityO.get();
        String fieldsJson = maxEntity.getFields();
        if (fieldsJson != null && !fieldsJson.isEmpty()) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                Map<String, Object> fieldsMap = objectMapper.readValue(fieldsJson, Map.class);
                Map<String, Object> financialIncome = ReportFieldParser.getNestedSection(fieldsMap,
                        "financial_income");
                if (financialIncome != null) {
                    String stakingRewardsIncome = ReportFieldParser.getNestedFieldValue(financialIncome,
                            "staking_rewards_income");
                    if (stakingRewardsIncome != null) {
                        BigDecimal stakingRewardsIncomeValue = new BigDecimal(stakingRewardsIncome);
                        incomeStream.put(IncomeStatemenCategories.STAKING_REWARDS, stakingRewardsIncomeValue.doubleValue());
                    }
                    String netIncomeOptionsSale = ReportFieldParser.getNestedFieldValue(financialIncome,
                            "net_income_options_sale");
                    if (netIncomeOptionsSale != null) {
                        BigDecimal netIncomeOptionsSaleValue = new BigDecimal(netIncomeOptionsSale);
                        incomeStream.put(IncomeStatemenCategories.OTHER, netIncomeOptionsSaleValue.doubleValue());
                    }
                    String financialRevenues = ReportFieldParser.getNestedFieldValue(financialIncome,
                            "financial_revenues");
                    if (financialRevenues != null) {
                        BigDecimal financialRevenuesValue = new BigDecimal(financialRevenues);
                        incomeStream.put(IncomeStatemenCategories.FINANCIAL_INCOME, financialRevenuesValue.doubleValue());
                    }
                    String realisedGains = ReportFieldParser.getNestedFieldValue(financialIncome,
                            "realised_gains_on_sale_of_cryptocurrencies");
                    if (realisedGains != null) {
                        BigDecimal realisedGainsValue = new BigDecimal(realisedGains);
                        incomeStream.put(IncomeStatemenCategories.GAINS_ON_SALES_OF_CRYPTO_CURRENCIES,
                                realisedGainsValue.doubleValue());
                    }
                }
                Map<String, Object> revenues = ReportFieldParser.getNestedSection(fieldsMap, "revenues");
                if (revenues != null) {
                    String buildOfLongTermProvision = ReportFieldParser.getNestedFieldValue(revenues,
                            "build_of_long_term_provision");
                    if (buildOfLongTermProvision != null) {
                        BigDecimal buildingOfLongTermProvisions = new BigDecimal(buildOfLongTermProvision);
                        incomeStream.put(IncomeStatemenCategories.BUILDING_OF_PROVISIONS,
                                buildingOfLongTermProvisions.doubleValue());
                    }
                    String otherIncome = ReportFieldParser.getNestedFieldValue(revenues, "other_income");
                    if (otherIncome != null) {
                        BigDecimal otherIncomeValue = new BigDecimal(otherIncome);
                        incomeStream.merge(IncomeStatemenCategories.OTHER, otherIncomeValue.doubleValue(),
                                Double::sum);
                    }
                }
            } catch (Exception e) {
                log.error("Error parsing balance sheet fields JSON", e);
            }
        }
        return incomeStream;
    }
}
