package org.cardanofoundation.reeve.indexer.service.metrics.executors;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.cardanofoundation.reeve.indexer.model.domain.IncomeStatemenCategories;
import org.cardanofoundation.reeve.indexer.model.domain.MetricEnum;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;
import org.cardanofoundation.reeve.indexer.service.ReportService;
import org.cardanofoundation.reeve.indexer.service.metrics.MetricExecutor;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
                    String profitForTheYearString = (String)fieldsMap.get("profit_for_the_year");
                    if(profitForTheYearString != null) {
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

                Map<String, Object> costOfGoodsAndServices = (Map<String, Object>) fieldsMap
                        .get("cost_of_goods_and_services");
                if (costOfGoodsAndServices != null && costOfGoodsAndServices.get("external_services") != null) {
                    BigDecimal externalServices = new BigDecimal(
                            (String) costOfGoodsAndServices.get("external_services"));
                    totalExpenses.merge(IncomeStatemenCategories.COST_OF_SERVICE, externalServices.intValue(),
                            Integer::sum);
                }

                Map<String, Object> operatingExpenses = (Map<String, Object>) fieldsMap.get("operating_expenses");
                if (operatingExpenses != null) {
                    if (operatingExpenses.get("personnel_expenses") != null) {
                        BigDecimal personnelExpenses = new BigDecimal(
                                (String) operatingExpenses.get("personnel_expenses"));
                        totalExpenses.merge(IncomeStatemenCategories.PERSONNEL_EXPENSES, personnelExpenses.intValue(),
                                Integer::sum);
                    }
                    int financialExpenses = 0;
                    if (operatingExpenses.get("general_and_administrative_expenses") != null) {
                        financialExpenses += new BigDecimal(
                                (String) operatingExpenses.get("general_and_administrative_expenses")).intValue();
                    }
                    if (operatingExpenses.get("amortization_on_intangible_assets") != null) {
                        financialExpenses += new BigDecimal(
                                (String) operatingExpenses.get("amortization_on_intangible_assets")).intValue();
                    }
                    if (operatingExpenses.get("depreciation_and_impairment_losses_on_tangible_assets") != null) {
                        financialExpenses += new BigDecimal(
                                (String) operatingExpenses.get("depreciation_and_impairment_losses_on_tangible_assets"))
                                .intValue();
                    }
                    if (operatingExpenses.get("rent_expenses") != null) {
                        financialExpenses += new BigDecimal((String) operatingExpenses.get("rent_expenses")).intValue();
                    }
                    totalExpenses.merge(IncomeStatemenCategories.FINANCIAL_EXPENSES, financialExpenses, Integer::sum);
                }

                Map<String, Object> financialIncome = (Map<String, Object>) fieldsMap.get("financial_income");
                if (financialIncome != null && financialIncome.get("financial_expenses") != null) {
                    BigDecimal financialExpenses = new BigDecimal((String) financialIncome.get("financial_expenses"));
                    totalExpenses.merge(IncomeStatemenCategories.TAX_EXPENSES, financialExpenses.intValue(),
                            Integer::sum);
                }

                Map<String, Object> taxExpenses = (Map<String, Object>) fieldsMap.get("tax_expenses");
                if (taxExpenses != null && taxExpenses.get("direct_taxes") != null) {
                    BigDecimal directTaxes = new BigDecimal((String) taxExpenses.get("direct_taxes"));
                    totalExpenses.merge(IncomeStatemenCategories.OTHER_OPERATING_EXPENSES, directTaxes.intValue(),
                            Integer::sum);
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
                Map<String, Object> financialIncome = (Map<String, Object>) fieldsMap.get("financial_income");
                if (financialIncome != null) {
                    if (financialIncome.get("staking_rewards_income") != null) {
                        BigDecimal stakingRewardsIncome = new BigDecimal(
                                (String) financialIncome.get("staking_rewards_income"));
                        incomeStream.put(IncomeStatemenCategories.STAKING_REWARDS, stakingRewardsIncome.doubleValue());
                    }
                    if (financialIncome.get("net_income_options_sale") != null) {
                        BigDecimal netIncomeOptionsSale = new BigDecimal(
                                (String) financialIncome.get("net_income_options_sale"));
                        incomeStream.put(IncomeStatemenCategories.OTHER,
                                netIncomeOptionsSale.doubleValue());
                    }
                    if (financialIncome.get("financial_revenues") != null) {
                        BigDecimal financialRevenues = new BigDecimal(
                                (String) financialIncome.get("financial_revenues"));
                        incomeStream.put(IncomeStatemenCategories.FINANCIAL_INCOME,
                                financialRevenues.doubleValue());
                    }
                    if (financialIncome.get("realised_gains_on_sale_of_cryptocurrencies") != null) {
                        BigDecimal realisedGains = new BigDecimal(
                                (String) financialIncome.get("realised_gains_on_sale_of_cryptocurrencies"));
                        incomeStream.put(IncomeStatemenCategories.GAINS_ON_SALES_OF_CRYPTO_CURRENCIES,
                                realisedGains.doubleValue());
                    }
                }
                Map<String, Object> revenues = (Map<String, Object>) fieldsMap.get("revenues");
                if (revenues != null) {
                    if (revenues.get("build_of_long_term_provision") != null) {
                        BigDecimal buildingOfLongTermProvisions = new BigDecimal(
                                (String) revenues.get("build_of_long_term_provision"));
                        incomeStream.put(IncomeStatemenCategories.BUILDING_OF_PROVISIONS,
                                buildingOfLongTermProvisions.doubleValue());
                    }
                    if (revenues.get("other_income") != null) {
                        BigDecimal otherIncome = new BigDecimal(
                                (String) revenues.get("other_income"));
                        incomeStream.merge(IncomeStatemenCategories.OTHER,
                                otherIncome.doubleValue(), Double::sum);
                    }
                }
            } catch (Exception e) {
                log.error("Error parsing balance sheet fields JSON", e);
            }
        }
        return incomeStream;
    }
}
