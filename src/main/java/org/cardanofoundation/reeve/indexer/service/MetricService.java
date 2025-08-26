package org.cardanofoundation.reeve.indexer.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.cardanofoundation.reeve.indexer.model.domain.MetricEnum;
import org.cardanofoundation.reeve.indexer.service.metrics.MetricExecutor;
import org.cardanofoundation.reeve.indexer.service.metrics.MetricNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricService {

    @Value("${reeve.dashboard-folder-path}")
    private String dashboardFolderPath;

    private final List<MetricExecutor> metricExecutors;

    public String getOrgDashboardFromFile(String orgId) {
        String filePath = String.format("%s/%s.json", dashboardFolderPath, orgId);
        // read the file and return the content
        try {
            return Files.readString(Path.of(filePath));
        } catch (IOException e) {
            log.error("Error reading dashboard file for orgId {}: {}", orgId, e.getMessage());
            return null;
        }
    }

    public Map<MetricEnum, List<MetricEnum.SubMetric>> getAvailableMetrics() {
        return metricExecutors.stream()
                .map(metricExecutorInterface -> Map.entry(metricExecutorInterface.getName(),
                        metricExecutorInterface.getAvailableMetrics()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public Map<MetricEnum, List<Object>> getData(Map<MetricEnum, List<MetricEnum.SubMetric>>  metrics, String organisationID, Optional<LocalDate> startDate, Optional<LocalDate> endDate) {
        return metrics.entrySet().stream()
                .map(metric -> {
                    MetricExecutor metricExecutor = getMetricExecutor(metric.getKey());
                    List<Object> metricData = metric.getValue().stream().map(s -> metricExecutor.getData(s,organisationID, startDate, endDate)).toList();

                    return Map.entry(metric.getKey(), metricData);
                }).collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    private MetricExecutor getMetricExecutor(MetricEnum metricName) {
        return metricExecutors.stream()
                .filter(metricExecutorInterface -> metricExecutorInterface.getName().equals(metricName))
                .findFirst()
                .orElseThrow(() -> new MetricNotFoundException(String.format("Metric %s not found", metricName)));
    }
}
