package org.cardanofoundation.reeve.indexer.config;

import lombok.Data;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Config for the indexer's own on-chain CIP-170 {@code ATTEST} tx submitter (design doc Part A / A5)
 * — see {@link CardAttestationSubmitterConfig} for how these are wired, and {@code
 * org.cardanofoundation.reeve.indexer.service.CardTxSubmitter}'s javadoc for why this exists at all
 * (the indexer has no tx-submission infrastructure otherwise).
 *
 * <p><b>*** DEPLOYMENT ACTION REQUIRED ***</b> to enable card attestation: set {@link #enabled}=true,
 * {@link #organiserMnemonic} to a wallet mnemonic that is FUNDED on {@link #network}, and {@link
 * #blockfrostProjectId} to a Blockfrost project id for that same network. Left disabled by default —
 * a deployment that never attests cards needs none of this.
 */
@Configuration
@ConfigurationProperties(prefix = "keri.attestation.submitter")
@Data
public class CardAttestationSubmitterProperties {

    /** Master switch: when {@code false} (the default), none of the beans in {@link
     *  CardAttestationSubmitterConfig} are created and {@code CardAttestService} fails every attest
     *  step with a clear "no submitter configured" error rather than silently no-oping. */
    private boolean enabled = false;

    /** {@code mainnet}, {@code preprod}, or {@code preview}. Defaults to {@code preprod} — never
     *  {@code mainnet} by accident. */
    private String network = "preprod";

    /** The organiser wallet's mnemonic. MUST be funded on {@link #network} — see this class's own
     *  javadoc. Never logged. */
    private String organiserMnemonic;

    /** Blockfrost base URL for {@link #network}, e.g. {@code https://cardano-preprod.blockfrost.io/api/v0/}. */
    private String blockfrostBaseUrl;

    /** Blockfrost project id for {@link #network}. */
    private String blockfrostProjectId;
}
