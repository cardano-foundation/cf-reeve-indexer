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

import org.cardanofoundation.reeve.indexer.model.domain.Currency;

/**
 * A single event inside a {@code FUNDING} metadata bundle. An event is either a well-known
 * grant-lifecycle event ({@code FUNDING}/{@code SPENDING}/{@code REFUND}) or an organisation-defined
 * custom event whose extra fields are free-form. Grant events carry their allocations and, for
 * {@code SPENDING}, a single inline spend record (amount/vendor/currency etc.). The known fields
 * below are mapped explicitly; any additional properties of a custom event are captured in
 * {@link #custom} so nothing is lost.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class FundingEvent {

    private String id;
    private String type;
    private String fundingTx;
    private String fundingId;
    private String fundingEntity;

    // Inline spend record — present on SPENDING events (a single spend per event, per the schema).
    private BigDecimal amountRcy;
    private BigDecimal amountFcy;
    private String vendor;
    private String spendingCategory;
    private String fxRate;
    private String hash;
    private String notes;
    private LocalDate date;

    @JsonProperty("currency_rcy")
    private Currency currency;

    @JsonProperty("currency_fcy")
    private Currency currencyFcy;

    @JsonProperty("allocation")
    private List<ProjectAllocation> allocations;

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
     * The event {@code date}, used for storage and date-range filtering. Every event type
     * (FUNDING/SPENDING/REFUND and custom) now carries a date; it resolves to null only when the
     * source omitted it.
     */
    @JsonIgnore
    public LocalDate getResolvedDate() {
        return date;
    }

    /**
     * Event total in the reporting currency, used for storage and amount filtering/sorting: the
     * inline spend amount when present (SPENDING), otherwise the sum of allocated milestone amounts
     * (FUNDING), otherwise null (custom events).
     */
    @JsonIgnore
    public BigDecimal getTotalAmount() {
        if (amountRcy != null) {
            return amountRcy;
        }
        if (allocations != null && !allocations.isEmpty()) {
            BigDecimal sum = allocations.stream()
                    .map(ProjectAllocation::getEffectiveMilestones)
                    .filter(ms -> ms != null)
                    .flatMap(List::stream)
                    .map(Milestone::getAllocatedAmount)
                    .filter(a -> a != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return sum.signum() == 0 ? null : sum;
        }
        return null;
    }

    @JsonIgnore
    public Optional<Map<String, Object>> getCustomDataIfPresent() {
        return custom == null || custom.isEmpty() ? Optional.empty() : Optional.of(custom);
    }
}
