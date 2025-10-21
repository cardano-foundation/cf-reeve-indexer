package org.cardanofoundation.reeve.indexer.model.response;

import java.time.LocalDateTime;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class DataResponse {

    private LocalDateTime timestamp;
    private Map<String, Double> datumData;
    private Map<String, Double> redeemerData;

}
