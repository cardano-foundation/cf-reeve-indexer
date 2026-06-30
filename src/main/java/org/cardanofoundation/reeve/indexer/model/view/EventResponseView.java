package org.cardanofoundation.reeve.indexer.model.view;

import java.util.List;
import java.util.Optional;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import org.springframework.http.ProblemDetail;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Envelope for event search/lookup responses, mirroring the transaction and report response views.
 */
@Getter
@Setter
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EventResponseView {

    private Boolean success;
    private long total;
    private List<EventView> events;
    private Optional<ProblemDetail> error;
    private int page;
    private int size;

    public static EventResponseView createSuccess(List<EventView> events, long totalElements,
            int page, int size) {
        return new EventResponseView(true, totalElements, events, Optional.empty(), page, size);
    }

    public static EventResponseView createFail(ProblemDetail error) {
        return EventResponseView.builder()
                .success(false)
                .error(Optional.of(error))
                .build();
    }
}
