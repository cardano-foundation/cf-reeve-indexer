package org.cardanofoundation.reeve.indexer.service.metrics;

public class MetricNotFoundException extends RuntimeException {
    public MetricNotFoundException(String message) {
        super(message);
    }
}
