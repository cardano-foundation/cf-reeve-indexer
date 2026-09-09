package org.cardanofoundation.reeve.indexer.model.domain.event;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.util.ChunkedStringDeserializer;

/**
 * A milestone targeted by an event allocation, with the amount allocated to it in the
 * organisation's reporting currency.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class Milestone {

    private String milestoneId;
    @JsonDeserialize(using = ChunkedStringDeserializer.class)
    private String milestoneTitle;
    private BigDecimal allocatedAmount;
}
