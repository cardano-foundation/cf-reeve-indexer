package org.cardanofoundation.reeve.indexer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableConfigurationProperties
@EntityScan({
        "org.cardanofoundation.reeve.indexer.model"
})
@EnableJpaRepositories({
        "org.cardanofoundation.reeve.indexer.model"
})
public class ReeveIndexingExampleApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReeveIndexingExampleApplication.class, args);
    }

}
