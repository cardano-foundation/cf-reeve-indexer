package org.cardanofoundation.reeve.indexer.model.view;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import org.cardanofoundation.reeve.indexer.model.entity.EventEntity;

/**
 * Public, organisation-facing representation of a single {@code FUNDING} bundle event, including its
 * inline spend record (SPENDING events), allocations and (for custom events) free-form fields.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Slf4j
@JsonNaming(PropertyNamingStrategies.LowerCamelCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventView {

    private Long id;
    private String txHash;
    private String organisationId;
    private String eventId;
    private String eventType;
    private String eventCategory;
    private String fundingTx;
    private String fundingId;
    private String fundingEntity;

    // Inline spend record (SPENDING events).
    private BigDecimal amountRcy;
    private BigDecimal amountFcy;
    private String vendor;
    private String spendingCategory;
    private String fxRate;
    private String hash;
    private String notes;
    private String currencyId;
    private String currencyCustCode;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String version;
    private String ipfsCid;
    private BigDecimal totalAmount;
    private List<EventAllocationView> allocations;
    private JsonNode customData;

    public static EventView fromEntity(EventEntity entity, ObjectMapper objectMapper) {
        JsonNode customData = null;
        if (entity.getCustomData() != null && !entity.getCustomData().isBlank()) {
            try {
                customData = objectMapper.readTree(entity.getCustomData());
            } catch (Exception e) {
                log.warn("Failed to parse custom_data for event {}: {}", entity.getId(),
                        e.getMessage());
            }
        }
        return EventView.builder()
                .id(entity.getId())
                .txHash(entity.getTxHash())
                .organisationId(entity.getOrganisationId())
                .eventId(entity.getEventId())
                .eventType(entity.getEventType())
                .eventCategory(entity.getEventCategory())
                .fundingTx(entity.getFundingTx())
                .fundingId(entity.getFundingId())
                .fundingEntity(entity.getFundingEntity())
                .amountRcy(entity.getAmountRcy())
                .amountFcy(entity.getAmountFcy())
                .vendor(entity.getVendor())
                .spendingCategory(entity.getSpendingCategory())
                .fxRate(entity.getFxRate())
                .hash(entity.getHash())
                .notes(entity.getNotes())
                .currencyId(entity.getCurrencyId())
                .currencyCustCode(entity.getCurrencyCustCode())
                .date(entity.getDate())
                .version(entity.getVersion())
                .ipfsCid(entity.getIpfsCid())
                .totalAmount(entity.getTotalAmount())
                .allocations(entity.getAllocations().stream()
                        .map(EventAllocationView::fromEntity)
                        .toList())
                .customData(customData)
                .build();
    }
}
