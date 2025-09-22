package org.cardanofoundation.reeve.indexer.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import org.cardanofoundation.reeve.indexer.model.domain.MetricEnum;
import org.cardanofoundation.reeve.indexer.service.metrics.MetricExecutor;
import org.cardanofoundation.reeve.indexer.service.metrics.MetricNotFoundException;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricService {

    private final List<MetricExecutor> metricExecutors;

    public String getOrgDashboardFromFile(String orgId) {
        String resourcePath = String.format("dashboards/%s.json", orgId);
        try {
            ClassPathResource resource = new ClassPathResource(resourcePath);
            if (!resource.exists()) {
                log.warn("Dashboard file not found for orgId: {}", orgId);
                return null;
            }

            try (InputStream inputStream = resource.getInputStream()) {
                return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
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
