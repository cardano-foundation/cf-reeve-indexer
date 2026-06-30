package org.cardanofoundation.reeve.indexer.model.domain.event;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * Off-chain manifest variant of an {@code EVENT_BUNDLE} {@code data} field. Instead of embedding
 * the events inline, the bundle references an IPFS document holding the events.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class IpfsEventManifest {

    private String id;
    private String ipfsCid;
    private EventInterval interval;
    private LocalDate date;
    private Integer eventCount;
}
