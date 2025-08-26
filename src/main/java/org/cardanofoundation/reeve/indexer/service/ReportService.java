package org.cardanofoundation.reeve.indexer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cardanofoundation.reeve.indexer.model.domain.Interval;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;
import org.cardanofoundation.reeve.indexer.model.repository.ReportRepository;
import org.cardanofoundation.reeve.indexer.model.view.ReportView;
import org.hibernate.query.sqm.IntervalType;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final OrganisationService organisationService;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    public List<ReportView> findAllByTypeAndPeriod(String organisationId, String reportType,
            String intervalType, Short year, Short period) {
       return reportRepository.findAllByOrganisationIdAndSubTypeAndIntervalAndYearAndPeriod(
                organisationId, reportType, intervalType != null ? Interval.valueOf(intervalType) : null, year, period)
                .stream()
                .map(reportEntity -> {
                    try {
                        return ReportView.fromEntity(reportEntity,
                                organisationService.findById(reportEntity.getOrganisationId()).orElseThrow(),
                                objectMapper);
                    } catch (Exception e) {
                        log.error("Error converting ReportEntity to ReportView: {}", e.getMessage());
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public List<ReportView> findAll() {
        return reportRepository.findAll()
                .stream()
                .map(reportEntity -> {
                    try {
                        return ReportView.fromEntity(reportEntity,
                                organisationService.findById(reportEntity.getOrganisationId()).orElseThrow(),
                                objectMapper);
                    } catch (Exception e) {
                        log.error("Error converting ReportEntity to ReportView: {}", e.getMessage());
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public Set<ReportEntity> findReportsInDateRange(String organisationId,
                                                    String reportType,
                                                    Optional<LocalDate> startDateO, Optional<LocalDate> endDateO) {
        LocalDate startDate = startDateO.orElse(LocalDate.EPOCH);
        LocalDate endDate = endDateO.orElse(LocalDate.now(clock));
        Set<ReportEntity> reportEntities = reportRepository.findByTypeAndWithinYearRange(organisationId, reportType, startDate.getYear(), endDate.getYear());

        // filtering by dates
        reportEntities = reportEntities.stream().filter(reportEntity -> {
            LocalDate reportStartDate = getReportStartDate(reportEntity.getInterval(), reportEntity.getPeriod(), reportEntity.getYear());
            LocalDate reportEndDate = getReportEndDate(reportEntity.getInterval(), reportStartDate);
            return reportStartDate.plusDays(1).isAfter(startDate) && reportEndDate.minusDays(1).isBefore(endDate);
        }).collect(Collectors.toSet());
        // sorting by Year, Quarter, Month
        List<ReportEntity> sortedEntities = reportEntities.stream().sorted((o1, o2) -> {
            if (!Objects.equals(o1.getYear(), o2.getYear())) {
                return Integer.compare(o1.getYear(), o2.getYear());
            }
            if (o1.getInterval() != o2.getInterval()) {
                return Integer.compare(o1.getInterval().ordinal(), o2.getInterval().ordinal());
            }
            return Integer.compare(o1.getPeriod(), o2.getPeriod());
        }).toList();

        // filtering if there is bigger interval already included means if this report is for jan'24 and there is a report for Q1'24, we don't need the january one
        return sortedEntities.stream().filter(reportEntity -> {
            // if the report is already a year, we don't need to check anything we just need to check if there is already a report for the same year with a higher version
            if (reportEntity.getInterval() == Interval.YEAR) {
                return sortedEntities.stream().filter(r -> r.getYear().equals(reportEntity.getYear()) && r.getVer() > reportEntity.getVer()).findAny().isEmpty();
            }
            // for quarters we need to check if there is a report for the same year or quarter with a higher version
            if (reportEntity.getInterval() == Interval.QUARTER) {
                return sortedEntities.stream().filter(r -> r.getInterval() == Interval.YEAR && r.getYear().equals(reportEntity.getYear())).findAny().isEmpty()
                        && sortedEntities.stream().filter(r ->
                        r.getInterval() == Interval.QUARTER
                                && r.getPeriod().equals(reportEntity.getPeriod())
                                && r.getVer() > reportEntity.getVer()).findAny().isEmpty();
            }
            // For months we need to check if there is a report for the same year or quarter or a month report with a higer version
            if (reportEntity.getInterval() == Interval.MONTH) {
                int quarter = (reportEntity.getPeriod() - 1) / 3 + 1;
                return sortedEntities.stream().filter(r -> r.getInterval() == Interval.YEAR && r.getYear().equals(reportEntity.getYear())).findAny().isEmpty()
                        && sortedEntities.stream().filter(r ->
                        r.getInterval() == Interval.QUARTER
                                && r.getPeriod().equals(quarter)).findAny().isEmpty() &&
                        sortedEntities.stream().filter(r ->
                                r.getInterval() == Interval.MONTH
                                        && r.getPeriod().equals(reportEntity.getPeriod())
                                        && r.getVer() > reportEntity.getVer()).findAny().isEmpty();
            }
            return true;
        }).collect(Collectors.toSet());
    }

    public LocalDate getReportStartDate(Interval interval, Integer period, Integer year) {
        switch (interval) {
            case MONTH:
                return LocalDate.of(year, period, 1);
            case QUARTER:
                int month = (period - 1) * 3 + 1; // Convert quarter to starting month
                return LocalDate.of(year, month, 1);
            case YEAR:
                return LocalDate.of(year, 1, 1);
            default:
                throw new IllegalArgumentException("Unsupported IntervalType: " + interval);
        }
    }

    public LocalDate getReportEndDate(Interval interval, LocalDate startDate) {
        switch (interval) {
            case MONTH:
                return startDate.plusMonths(1).minusDays(1);
            case QUARTER:
                return startDate.plusMonths(3).minusDays(1);
            case YEAR:
                return startDate.plusYears(1).minusDays(1);
            default:
                throw new IllegalArgumentException("Unsupported IntervalType: " + interval);
        }
    }

    public Optional<ReportEntity> getMostRecentReport(Set<ReportEntity> reportEntities) {
        return reportEntities.stream()
                .max(Comparator.comparing(o -> getReportEndDate(
                        o.getInterval(),
                        getReportStartDate(
                                o.getInterval(),
                                o.getPeriod(), // handle Optional safely if needed
                                o.getYear()))));
    }
}
