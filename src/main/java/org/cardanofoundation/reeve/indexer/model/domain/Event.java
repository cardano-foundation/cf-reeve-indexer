package org.cardanofoundation.reeve.indexer.model.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    private String code;
    private String name;

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
