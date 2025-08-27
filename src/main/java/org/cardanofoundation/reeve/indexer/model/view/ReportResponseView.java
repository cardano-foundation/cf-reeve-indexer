package org.cardanofoundation.reeve.indexer.model.view;

import java.util.List;
import java.util.Optional;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import org.springframework.http.ProblemDetail;

@Getter
@Setter
@AllArgsConstructor
public class ReportResponseView {

    private boolean success;

    private Long total;
    private List<ReportView> reports;
    private Optional<ProblemDetail> error;

    public static ReportResponseView createSuccess(List<ReportView> reports) {
        return new ReportResponseView(true, reports.stream().count(), reports,
                Optional.empty());
    }

    public static ReportResponseView createFail(ProblemDetail error) {
        return new ReportResponseView(false, 0L, List.of(), Optional.of(error));
    }
}
