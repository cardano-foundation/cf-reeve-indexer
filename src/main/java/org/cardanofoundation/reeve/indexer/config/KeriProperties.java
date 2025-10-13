package org.cardanofoundation.reeve.indexer.config;

import java.util.List;

import lombok.Data;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "keri")
@Data
public class KeriProperties {
    private String url;
    private String bootUrl;
    private List<String> oobis;
}
