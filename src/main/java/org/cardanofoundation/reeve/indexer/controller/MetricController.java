package org.cardanofoundation.reeve.indexer.controller;

import java.util.Optional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

import org.cardanofoundation.reeve.indexer.model.request.GetMetricDataRequest;
import org.cardanofoundation.reeve.indexer.model.view.MetricDataResponse;
import org.cardanofoundation.reeve.indexer.model.view.MetricView;
import org.cardanofoundation.reeve.indexer.service.MetricService;


@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
@Slf4j
public class MetricController {

    private final MetricService metricService;

    @Tag(name = "Metrics", description = "Get Preconfigured Dashboard for organisation")
    @GetMapping("/dashboards/{orgId}")
    public ResponseEntity<String> getOrgDashboard(@PathVariable("orgId") String orgId) {
        String dashboard = metricService.getOrgDashboardFromFile(orgId);
        if (dashboard != null) {
            return ResponseEntity.ok(dashboard);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Tag(name = "Metrics", description = "Available Metrics")
    @GetMapping(value = "/availableMetrics", produces = "application/json")
    public ResponseEntity<MetricView> availableDashboards() {
        return ResponseEntity.ok(new MetricView(metricService.getAvailableMetrics()));
    }

    @Tag(name = "Metrics", description = "Get Data from Metrics")
    @PostMapping(value = "/data", produces = "application/json")
    public ResponseEntity<MetricDataResponse> getDashboardData(@RequestBody GetMetricDataRequest getMetricDataRequest) {
        return ResponseEntity.ok(new MetricDataResponse(metricService.getData(
                getMetricDataRequest.getMetricView().getMetrics(),
                getMetricDataRequest.getOrganisationId(),
                Optional.ofNullable(getMetricDataRequest.getStartDate()),
                Optional.ofNullable(getMetricDataRequest.getEndDate()))));
    }


}
