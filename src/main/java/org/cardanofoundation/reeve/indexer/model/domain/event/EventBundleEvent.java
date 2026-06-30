package org.cardanofoundation.reeve.indexer.model.domain.event;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * A single event inside an {@code EVENT_BUNDLE}. A bundle event is either a well-known
 * grant-lifecycle event ({@code FUNDING}/{@code SPENDING}/{@code REFUND}) carrying allocations and
 * line items, or an organisation-defined custom event whose extra fields are free-form. The known
 * fields below are mapped explicitly; any additional properties of a custom event are captured in
 * {@link #custom} so nothing is lost.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class EventBundleEvent {

    private String id;
    private String type;
    private String fundingTx;
    private String fundingId;
    private String fundingEntity;
    private LocalDate date;

    @JsonProperty("allocation")
    private List<ProjectAllocation> allocations;

    @JsonProperty("item")
    private List<EventItem> items;

    /** Free-form additional fields carried by custom (organisation-defined) events. */
    @Builder.Default
    private Map<String, Object> custom = new LinkedHashMap<>();

    @JsonAnySetter
    public void putCustom(String key, Object value) {
        if (custom == null) {
            custom = new LinkedHashMap<>();
        }
        custom.put(key, value);
    }

    @JsonAnyGetter
    public Map<String, Object> getCustom() {
        return custom;
    }

    /** GRANT for the well-known lifecycle types, CUSTOM for everything else. */
    @JsonIgnore
    public EventCategory getCategory() {
        return GrantEventType.isGrantType(type) ? EventCategory.GRANT : EventCategory.CUSTOM;
    }

    /**
     * Best-effort event date used for storage and date-range filtering: the explicit event date if
     * present (custom events), otherwise the earliest line-item date (grant events), otherwise null.
     */
    @JsonIgnore
    public LocalDate getResolvedDate() {
        if (date != null) {
            return date;
        }
        if (items != null) {
            return items.stream()
                    .map(EventItem::getDate)
                    .filter(d -> d != null)
                    .min(LocalDate::compareTo)
                    .orElse(null);
        }
        return null;
    }

    /**
     * Event total in the reporting currency, used for storage and amount filtering/sorting: the sum
     * of line-item amounts when present (grant events), otherwise the sum of milestone amounts.
     */
    @JsonIgnore
    public BigDecimal getTotalAmount() {
        if (items != null && !items.isEmpty()) {
            return items.stream()
                    .map(EventItem::getAmountRcy)
                    .filter(a -> a != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        if (allocations != null && !allocations.isEmpty()) {
            return allocations.stream()
                    .map(ProjectAllocation::getMilestones)
                    .filter(ms -> ms != null)
                    .flatMap(List::stream)
                    .map(Milestone::getAmountRcy)
                    .filter(a -> a != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        return null;
    }

    @JsonIgnore
    public Optional<Map<String, Object>> getCustomDataIfPresent() {
        return custom == null || custom.isEmpty() ? Optional.empty() : Optional.of(custom);
    }
}
