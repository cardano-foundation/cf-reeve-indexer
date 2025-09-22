package org.cardanofoundation.reeve.indexer.model.view;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.model.entity.OrganisationEntity;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;

@AllArgsConstructor
@RequiredArgsConstructor
@Builder
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
public class ReportView {

    private String organisationId;
    private String currency;
    private String type;

    private String blockChainHash;

    private String intervalType;

    private Integer year;

    private Integer period;

    private Long ver;

    private Map<String, Object> data; // Assuming fields is a JSON string, adjust as necessary

    private boolean identityVerified;
    private String aid;
    private String sn;

    public static ReportView fromEntity(ReportEntity entity, OrganisationEntity organisationEntity, ObjectMapper objectMapper) throws JsonProcessingException {
        return ReportView.builder()
                .organisationId(entity.getOrganisationId())
                .type(entity.getSubType())
                .intervalType(entity.getInterval().name()) // Assuming Interval is an Enum
                .year(entity.getYear())
                .period(entity.getPeriod())
                .ver(entity.getVer())
                .currency(organisationEntity.getCurrencyId())
                .blockChainHash(entity.getTxHash())
                .data(objectMapper.readValue(entity.getFields(), Map.class))
                .identityVerified(entity.isIdentityVerified())
                .build();
    }
}
