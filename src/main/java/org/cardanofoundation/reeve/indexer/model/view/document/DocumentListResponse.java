package org.cardanofoundation.reeve.indexer.model.view.document;

import java.util.List;

public record DocumentListResponse(List<DocumentView> content, long total, int totalPages,
        int page, int size) {
}
