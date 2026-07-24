package org.cardanofoundation.reeve.indexer.config;

import java.util.Locale;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.bloxbean.cardano.client.account.Account;
import com.bloxbean.cardano.client.backend.api.BackendService;
import com.bloxbean.cardano.client.backend.blockfrost.service.BFBackendService;
import com.bloxbean.cardano.client.common.model.Network;
import com.bloxbean.cardano.client.common.model.Networks;

import org.cardanofoundation.reeve.indexer.service.CardTxSubmitter;
import org.cardanofoundation.reeve.indexer.service.OrganiserWalletCardTxSubmitter;

/**
 * Wires the indexer's own CIP-170 {@code ATTEST} tx submitter (design doc Part A / A5) — an organiser
 * {@link Account} (mnemonic-derived) submitting via a Blockfrost {@link BackendService}, the minimal
 * tx-submission infrastructure this indexer needs (it otherwise only READS the chain, via {@code
 * yaci-store} node sync — see {@code CardTxSubmitter}'s own javadoc for the full investigation
 * finding).
 *
 * <p>Entirely gated on {@code keri.attestation.submitter.enabled=true} (see {@link
 * CardAttestationSubmitterProperties#isEnabled()}): with it left at the default {@code false}, none
 * of these beans exist and {@code CardAttestService} fails every attest step with a clear "no
 * submitter configured" error instead of a confusing {@code NoSuchBeanDefinitionException} or a
 * silent no-op.
 *
 * <p><b>*** DEPLOYMENT ACTION REQUIRED ***</b>: enabling this WITHOUT funding {@link
 * #cardAttestationOrganiserAccount} first means every attest step will reach tx submission and then
 * fail with an insufficient-funds error from the backend — the wallet must hold ADA on the configured
 * network BEFORE the first card is attested.
 */
@Configuration
@ConditionalOnProperty(name = "keri.attestation.submitter.enabled", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
@Slf4j
public class CardAttestationSubmitterConfig {

    private final CardAttestationSubmitterProperties properties;

    @Bean
    public Account cardAttestationOrganiserAccount() {
        String mnemonic = properties.getOrganiserMnemonic();
        if (mnemonic == null || mnemonic.isBlank()) {
            throw new IllegalStateException(
                    "keri.attestation.submitter.enabled=true but keri.attestation.submitter.organiser-mnemonic is "
                            + "unset. *** DEPLOYMENT ACTION REQUIRED ***: card attestation submits the on-chain "
                            + "CIP-170 ATTEST tx from this wallet — it must be configured (and FUNDED) before the "
                            + "indexer can start with the submitter enabled.");
        }
        Account account = new Account(resolveNetwork(properties.getNetwork()), mnemonic);
        log.info("CIP-170 ATTEST tx submitter wallet address={} (network={}) -- *** MUST BE FUNDED before "
                + "attesting any card ***", account.baseAddress(), properties.getNetwork());
        return account;
    }

    @Bean
    public BackendService cardAttestationBackendService() {
        String projectId = properties.getBlockfrostProjectId();
        String baseUrl = properties.getBlockfrostBaseUrl();
        if (projectId == null || projectId.isBlank() || baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalStateException(
                    "keri.attestation.submitter.enabled=true but blockfrost-base-url/blockfrost-project-id are "
                            + "unset. *** DEPLOYMENT ACTION REQUIRED ***: the on-chain CIP-170 ATTEST tx is "
                            + "submitted via Blockfrost — both must be configured before the indexer can start "
                            + "with the submitter enabled.");
        }
        return new BFBackendService(baseUrl, projectId);
    }

    @Bean
    public CardTxSubmitter cardTxSubmitter(BackendService cardAttestationBackendService,
            Account cardAttestationOrganiserAccount) {
        return new OrganiserWalletCardTxSubmitter(cardAttestationBackendService, cardAttestationOrganiserAccount);
    }

    private static Network resolveNetwork(String network) {
        String normalized = network == null ? "" : network.toLowerCase(Locale.ROOT).strip();
        return switch (normalized) {
            case "mainnet" -> Networks.mainnet();
            case "preview" -> Networks.preview();
            case "preprod", "" -> Networks.preprod();
            default -> throw new IllegalStateException(
                    "Unknown keri.attestation.submitter.network '%s' (expected mainnet, preprod or preview)."
                            .formatted(network));
        };
    }
}
