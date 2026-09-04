package org.cardanofoundation.reeve.indexer.model.view;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;
import org.cardanofoundation.reeve.indexer.model.response.LEIResponse;
import org.cardanofoundation.reeve.indexer.util.ReportFieldParser;

@AllArgsConstructor
@RequiredArgsConstructor
@Builder
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class ReportView {

    private String organisationId;
    private String currency;
    private String subType;

    // Absent (null) on reports published before this field existed. Always included in the
    // response, even when null, so the frontend can distinguish "no regime on this legacy
    // report" from a field that failed to load.
    @JsonInclude(JsonInclude.Include.ALWAYS)
    private String accountingRegime;

    private String txHash;

    private String intervalType;

    private Integer year;

    private Integer period;

    private Long ver;

    private Map<String, Object> data; // Assuming fields is a JSON string, adjust as necessary

    private List<LEIResponse> identities;

    public static ReportView fromEntity(ReportEntity entity, OrganisationEntity organisationEntity, ObjectMapper objectMapper) throws JsonProcessingException {
        Map<String, Object> fieldsMap = objectMapper.readValue(entity.getFields(), Map.class);
        Map<String, Object> transformedData = ReportFieldParser.transformReportForDisplay(fieldsMap);

        return ReportView.builder()
                .organisationId(entity.getOrganisationId())
                .subType(entity.getSubType())
                .accountingRegime(entity.getAccountingRegime())
                .intervalType(entity.getInterval().name())
                .year(entity.getYear())
                .period(entity.getPeriod())
                .ver(entity.getVer())
                .currency(organisationEntity.getCurrencyId())
                .txHash(entity.getTxHash())
                .data(transformedData)
                .build();
    }
}
