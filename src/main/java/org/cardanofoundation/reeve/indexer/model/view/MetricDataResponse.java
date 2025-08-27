package org.cardanofoundation.reeve.indexer.model.view;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.cardanofoundation.reeve.indexer.model.domain.MetricEnum;


@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class MetricDataResponse {

    Map<MetricEnum, List<Object>> data;
}
