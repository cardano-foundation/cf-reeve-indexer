package org.cardanofoundation.reeve.indexer.model.view.document;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;

public record DocumentChecksView(CheckStatus manifest, CheckStatus ipfs,
        CheckStatus contentHash, CheckStatus envelope) {
}
