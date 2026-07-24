package org.cardanofoundation.reeve.indexer.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.bloxbean.cardano.client.account.Account;
import com.bloxbean.cardano.client.api.model.Amount;
import com.bloxbean.cardano.client.api.model.Result;
import com.bloxbean.cardano.client.backend.api.BackendService;
import com.bloxbean.cardano.client.function.helper.SignerProviders;
import com.bloxbean.cardano.client.metadata.Metadata;
import com.bloxbean.cardano.client.metadata.MetadataBuilder;
import com.bloxbean.cardano.client.metadata.MetadataMap;
import com.bloxbean.cardano.client.quicktx.QuickTxBuilder;
import com.bloxbean.cardano.client.quicktx.Tx;

/**
 * Minimal, config-driven {@link CardTxSubmitter}: builds, signs and submits a tx carrying only the
 * given metadata from an organiser wallet ({@link Account}, mnemonic-derived) via {@link
 * QuickTxBuilder} against a Blockfrost {@link BackendService}.
 *
 * <p>Ported (tx-assembly idiom) from the platform's ({@code cf-reeve-platform}) {@code
 * blockchain_publisher} module's {@code OrganiserWalletMetadataTxSubmitter#submitTransaction}: a
 * minimal 2-ADA organiser-to-organiser transfer carrying only the label-170 metadata, signed and
 * submitted via {@code completeAndWait()}. Unlike that class, this has no {@code confirmations()}/
 * {@code readCip170Metadata()} — the indexer already reads label-170 metadata back off its own
 * yaci-store node sync ({@code ReeveMetadataStorage}/{@code KeriService}), so there is no need to
 * duplicate that via Blockfrost here — and returns a plain tx hash / throws {@link
 * CardTxSubmissionException} rather than {@code Either<ProblemDetail, String>} (no {@code vavr} in
 * this app).
 *
 * <p><b>*** DEPLOYMENT ACTION REQUIRED ***</b>: {@link #organiserWallet} MUST be FUNDED (a few ADA is
 * enough — one card attestation costs one minimal 2-ADA transfer plus fees) on whichever network
 * {@code keri.attestation.submitter.network} selects, or every attest step fails at tx submission
 * with an insufficient-funds error from the backend.
 */
@Slf4j
@RequiredArgsConstructor
public class OrganiserWalletCardTxSubmitter implements CardTxSubmitter {

    private final BackendService backendService;
    private final Account organiserWallet;

    @Override
    public String submitMetadataTransaction(long label, MetadataMap metadata) {
        try {
            Metadata txMetadata = MetadataBuilder.createMetadata();
            txMetadata.put(label, metadata);

            QuickTxBuilder quickTxBuilder = new QuickTxBuilder(backendService);
            Tx tx = new Tx()
                    .payToAddress(organiserWallet.baseAddress(), Amount.ada(2.0))
                    .attachMetadata(txMetadata)
                    .from(organiserWallet.baseAddress());

            Result<String> result = quickTxBuilder.compose(tx)
                    .withSigner(SignerProviders.signerFrom(organiserWallet))
                    .completeAndWait();

            if (!result.isSuccessful()) {
                log.warn("Failed to submit CIP-170 ATTEST tx, label:{}, response:{}", label, result.getResponse());
                throw new CardTxSubmissionException(
                        "Failed to submit CIP-170 ATTEST tx (label %d): %s".formatted(label, result.getResponse()));
            }

            String txHash = result.getValue();
            log.info("CIP-170 ATTEST tx submitted, label:{}, txHash:{}", label, txHash);
            return txHash;
        } catch (CardTxSubmissionException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error submitting CIP-170 ATTEST tx, label:{}", label, e);
            throw new CardTxSubmissionException(
                    "Error submitting CIP-170 ATTEST tx (label %d): %s".formatted(label, e.getMessage()), e);
        }
    }
}
