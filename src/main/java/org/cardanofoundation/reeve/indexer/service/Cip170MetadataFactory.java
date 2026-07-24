package org.cardanofoundation.reeve.indexer.service;

import java.security.DigestException;

import org.springframework.stereotype.Service;

import co.nstant.in.cbor.CborException;
import com.bloxbean.cardano.client.common.cbor.CborSerializationUtil;
import com.bloxbean.cardano.client.metadata.MetadataBuilder;
import com.bloxbean.cardano.client.metadata.MetadataMap;

import org.cardanofoundation.signify.cesr.Diger;
import org.cardanofoundation.signify.cesr.args.RawArgs;

/**
 * Builds the CIP-170 label-170 {@code ATTEST} metadata map and computes the Blake3-256 digest of a
 * metadata map's canonical CBOR bytes (design doc Part A / A5).
 *
 * <p>Ported from the platform's ({@code cf-reeve-platform}) {@code keri_attestation} module's {@code
 * Cip170MetadataFactory} — {@link #attestMap} and {@link #digestOf} only; that module's {@code
 * authBeginMap} (and its chunking helpers) have no equivalent here since this ceremony has no
 * AUTH_BEGIN step.
 *
 * <p><b>Note on insertion order:</b> {@link CborSerializationUtil}'s serialization defaults to
 * canonical CBOR (RFC 7049 §3.9), which sorts map keys deterministically regardless of {@code put()}
 * insertion order — so on-chain byte identity with another label-170 publisher comes from matching
 * its exact key/value <em>set</em>, not from mirroring its insertion order.
 *
 * <p>Pure and stateless: every method is a deterministic function of its arguments.
 */
@Service
public class Cip170MetadataFactory {

    /**
     * Builds the label-170 {@code ATTEST} map: {@code t="ATTEST"}, {@code s=kelSequence},
     * {@code i=aid}, {@code d=digestQb64}, {@code v={v:"1.0"}}.
     */
    public MetadataMap attestMap(String aid, String digestQb64, String kelSequence) {
        MetadataMap map = MetadataBuilder.createMap();
        map.put("t", "ATTEST");
        map.put("s", kelSequence);
        map.put("i", aid);
        map.put("d", digestQb64);

        MetadataMap v = MetadataBuilder.createMap();
        v.put("v", "1.0");
        map.put("v", v);

        return map;
    }

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
