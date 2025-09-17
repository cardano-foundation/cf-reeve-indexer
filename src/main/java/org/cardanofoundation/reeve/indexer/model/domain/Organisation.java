package org.cardanofoundation.reeve.indexer.model.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class Organisation {

    private String id;
    private String name;
    private String currencyId;
    private String countryCode;
    private String taxIdNumber;

    public void setName(Object name) {
        if (name instanceof String) {
            this.name = (String) name;
        } else if (name instanceof java.util.List) {
            this.name = String.join(",", ((java.util.List<?>) name).stream()
                    .map(Object::toString)
                    .toArray(String[]::new));
        } else if (name != null) {
            this.name = name.toString();
        } else {
            this.name = null;
        }
    }
}
