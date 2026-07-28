package org.cardanofoundation.reeve.indexer.service.card.attestation;

import java.security.DigestException;

import org.springframework.stereotype.Service;

import co.nstant.in.cbor.CborException;
import com.bloxbean.cardano.client.common.cbor.CborSerializationUtil;
import com.bloxbean.cardano.client.metadata.MetadataMap;

import org.cardanofoundation.signify.cesr.Diger;
import org.cardanofoundation.signify.cesr.args.RawArgs;

/**
 * Computes the Blake3-256 digest of a metadata map's canonical CBOR bytes — the CIP-170 digest idiom,
 * used by {@link CardAttestationDigestFactory} to freeze a card into the value the paired Veridian
 * wallet anchors in its KEL.
 *
 * <p>Only {@link #digestOf} is needed here: there is no AUTH_BEGIN step in this ceremony, and
 * building a label-170 {@code ATTEST} map for publication is unnecessary since nothing is published
 * on-chain (see {@code CardAttestService}'s javadoc). The indexer still READS label-170 ATTEST
 * metadata other publishers put on-chain ({@code ReeveMetadataStorage}, {@code KeriService}); it
 * just never builds one to submit.
 *
 * <p><b>Note on insertion order:</b> {@link CborSerializationUtil}'s serialization defaults to
 * canonical CBOR (RFC 7049 §3.9), which sorts map keys deterministically regardless of {@code put()}
 * insertion order — so a verifier rebuilding the same key/value <em>set</em> from a card gets a
 * byte-identical digest however it walks the JSON.
 *
 * <p>Pure and stateless: every method is a deterministic function of its arguments.
 */
@Service
public class Cip170MetadataFactory {

    /**
     * The Blake3-256 {@link Diger} qb64 digest of {@code CborSerializationUtil.serialize(map.getMap())}
     * — the idiom used to seal a reeve metadata map into a KERI interaction event / CIP-170 anchor.
     * Always starts with {@code "E"}, the CESR code for Blake3-256.
     */
    public String digestOf(MetadataMap map) {
        try {
            byte[] cbor = CborSerializationUtil.serialize(map.getMap());
            return new Diger(new RawArgs(), cbor).getQb64();
        } catch (CborException e) {
            throw new IllegalStateException("Failed to CBOR-serialize a metadata map for digesting.", e);
        } catch (DigestException e) {
            throw new IllegalStateException("Failed to compute the Blake3-256 digest of a metadata map.", e);
        }
    }
}
