package org.cardanofoundation.reeve.indexer.service;

import com.bloxbean.cardano.client.metadata.MetadataMap;

/**
 * Submits a Cardano tx carrying only the given metadata (the on-chain CIP-170 {@code ATTEST} publish,
 * design doc Part A / A5).
 *
 * <p><b>Investigation finding (A5):</b> the indexer is primarily a chain READER — it syncs from a
 * Cardano node via {@code yaci-store} (see {@code store.cardano.*}) and has NO tx-submission
 * infrastructure of its own: no {@code QuickTxBuilder}/{@code Account}/Blockfrost {@code
 * BackendService} anywhere in this codebase before this task. This port (mirroring the platform's
 * ({@code cf-reeve-platform}) {@code blockchain_publisher} module's {@code
 * OrganiserWalletMetadataTxSubmitter}) is the minimal addition needed to close that gap: an organiser
 * {@code Account} (mnemonic-derived) submits a small metadata-only tx via a Blockfrost {@code
 * BackendService}, wired behind {@code keri.attestation.submitter.*} (see {@link
 * org.cardanofoundation.reeve.indexer.config.CardAttestationSubmitterConfig}).
 *
 * <p><b>*** DEPLOYMENT ACTION REQUIRED ***</b>: this only exists (the {@code CardTxSubmitter} bean is
 * only created) when {@code keri.attestation.submitter.enabled=true} AND a mnemonic + Blockfrost
 * project id are configured. The configured organiser wallet MUST be FUNDED on the target network
 * before any card can be attested — {@link CardAttestService} fails every attest step with a clear,
 * actionable error when no submitter is configured, rather than silently no-oping.
 */
public interface CardTxSubmitter {

    /**
     * Builds, signs and submits a tx carrying only {@code metadata} under {@code label}.
     *
     * @return the tx hash
     * @throws CardTxSubmissionException on any failure to build, sign or submit the tx
     */
    String submitMetadataTransaction(long label, MetadataMap metadata);
}
