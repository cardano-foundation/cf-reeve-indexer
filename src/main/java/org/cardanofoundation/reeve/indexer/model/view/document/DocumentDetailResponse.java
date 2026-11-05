package org.cardanofoundation.reeve.indexer.model.view.document;

import java.util.List;

public record DocumentDetailResponse(String documentId, List<DocumentView> anchors,
        boolean duplicateAnchors) {
}
