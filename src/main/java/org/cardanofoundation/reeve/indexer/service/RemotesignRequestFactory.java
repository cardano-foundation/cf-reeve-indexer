package org.cardanofoundation.reeve.indexer.service;

import java.security.DigestException;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import org.cardanofoundation.signify.cesr.Saider;

/**
 * Builds the remotesign request KED sent to a paired Veridian wallet AID to anchor a card's
 * attestation digest in its KEL (design doc Part A / A5).
 *
 * <p><b>Wallet-verified payload shape.</b> Ported VERBATIM from the platform's ({@code
 * cf-reeve-platform}) {@code keri_attestation} module's {@code RemotesignRequestFactory} — this
 * wire shape is a proven, live-wallet-tested contract, not a design choice made in this port: a real
 * Veridian wallet's {@code processRemoteSignReq} expects a self-addressing payload ({@code i} present
 * <em>before</em> saidifying, {@code d} the SAID of the whole payload) and silently drops (no
 * notification, no UI) anything that doesn't look like one. Do not change this shape.
 *
 * <p>This builds an insertion-ordered map {@code {i: <walletAid>, d: "", metadataLabel: <label>,
 * metadataDigest: <digestQb64>}} run through {@link Saider#saidify(Map)}, which overwrites {@code d}
 * with the SAID of the whole map. The returned map's own {@code d} is what the wallet is expected to
 * anchor as its interaction-event seal — see {@code CardAttestService}'s seal-verification javadoc.
 */
@Service
public class RemotesignRequestFactory {

    /**
     * @param walletAid          the paired wallet's AID — becomes the payload's {@code i}. Must be
     *                           inserted before saidifying: signify's exchange-message builder does
     *                           {@code attrs.put("i", recipient); attrs.putAll(payload)} before the
     *                           wire send, so a payload SAID computed without {@code i} would mismatch
     *                           the SAID the wallet recomputes over the received (with-{@code i})
     *                           payload
     * @param metadataLabel      the Cardano metadata label the attestation is published under (this
     *                           ceremony's CIP-170 label, {@code keri.metadata-label}, as a string)
     * @param metadataDigestQb64 the card's own canonical attestation digest ({@link
     *                           CardAttestationDigestFactory#digestOf}) to anchor
     * @return the saidified KED to send as the exn payload ({@code a}) of a {@code
     *         /remotesign/ixn/req} exchange; its own {@code d} field is the payload SAID the wallet is
     *         expected to anchor as the KEL interaction event's seal
     */
    public Map<String, Object> anchorRequestKed(String walletAid, String metadataLabel, String metadataDigestQb64) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("i", walletAid);
        payload.put("d", "");
        payload.put("metadataLabel", metadataLabel);
        payload.put("metadataDigest", metadataDigestQb64);
        try {
            return Saider.saidify(payload).sad();
        } catch (DigestException e) {
            throw new IllegalStateException("Failed to compute the SAID of the remotesign request payload.", e);
        }
    }
}
