package org.cardanofoundation.reeve.indexer.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Configuration
@ConfigurationProperties(prefix = "keri")
@Data
public class KeriProperties {
    private String url;
    private String bootUrl;
    private String oobis;
    
    public List<String> getOobisList() {
        if (oobis == null || oobis.trim().isEmpty()) {
            return List.of();
        }
        return Arrays.stream(oobis.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}