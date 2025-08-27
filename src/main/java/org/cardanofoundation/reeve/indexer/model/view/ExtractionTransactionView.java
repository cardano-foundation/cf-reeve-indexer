package org.cardanofoundation.reeve.indexer.model.view;

import java.util.List;
import java.util.Optional;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import org.springframework.http.ProblemDetail;

import com.fasterxml.jackson.annotation.JsonInclude;

@Getter
@Setter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class ExtractionTransactionView {
    private Boolean success;

    private long total;

    private List<ExtractionTransactionItemView> transactions;

    private Optional<ProblemDetail> error;

    private int page;
    private int size;

    public static ExtractionTransactionView createSuccess(
            List<ExtractionTransactionItemView> transactions, long totalElements, int page,
            int limit) {
        return new ExtractionTransactionView(true, totalElements, transactions, Optional.empty(),
                page, limit);
    }

    public static ExtractionTransactionView createFail(ProblemDetail error) {
        return ExtractionTransactionView.builder()
                .error(Optional.of(error))
                .build();
    }
}
