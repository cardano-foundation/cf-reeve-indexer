package org.cardanofoundation.reeve.indexer.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.bloxbean.cardano.client.common.cbor.CborSerializationUtil;
import com.bloxbean.cardano.client.metadata.MetadataBuilder;
import com.bloxbean.cardano.client.metadata.MetadataMap;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.signify.cesr.Diger;
import org.cardanofoundation.signify.cesr.args.RawArgs;

/**
 * Small shape test for the ported {@link Cip170MetadataFactory} (design doc Part A / A5 review) —
 * mirrors the platform's own {@code Cip170MetadataFactoryTest} for {@code attestMap}/{@code
 * digestOf}, trimmed to what this port actually carries (no {@code authBeginMap}).
 */
class Cip170MetadataFactoryTest {

    private final Cip170MetadataFactory factory = new Cip170MetadataFactory();

    private static final String AID = "EAID_9x8y7z6w5v4u3t2s1r0q_ABCDEFGHIJK";
    private static final String DIGEST = "EDIGEST_1234567890abcdefghijklmnop";
    private static final String KEL_SEQUENCE = "3";

    @Test
    void attestMapHasExactFieldsFromReference() {
        MetadataMap map = factory.attestMap(AID, DIGEST, KEL_SEQUENCE);

        assertEquals("ATTEST", map.get("t"));
        assertEquals(KEL_SEQUENCE, map.get("s"));
        assertEquals(AID, map.get("i"));
        assertEquals(DIGEST, map.get("d"));

        MetadataMap v = (MetadataMap) map.get("v");
        assertEquals("1.0", v.get("v"));
        assertEquals(1, v.keys().size());
    }

    @Test
    void attestMapProducesTheSameCanonicalCborBytesAsAnIndependentlyBuiltReference() throws Exception {
        // Canonical CBOR (CborSerializationUtil.serialize's default) sorts map keys deterministically,
        // so this does not pin insertion order — it pins the exact key/value SET: an extra, missing,
        // renamed, or wrong-value key changes the serialized bytes and fails this test.
        MetadataMap reference = MetadataBuilder.createMap();
        reference.put("t", "ATTEST");
        reference.put("s", KEL_SEQUENCE);
        reference.put("i", AID);
        reference.put("d", DIGEST);
        MetadataMap referenceV = MetadataBuilder.createMap();
        referenceV.put("v", "1.0");
        reference.put("v", referenceV);

        MetadataMap map = factory.attestMap(AID, DIGEST, KEL_SEQUENCE);

        assertArrayEquals(CborSerializationUtil.serialize(reference.getMap()),
                CborSerializationUtil.serialize(map.getMap()));
    }

    @Test
    void digestOfMatchesTheTwoArgDigerIdiomAndStartsWithE() throws Exception {
        MetadataMap map = MetadataBuilder.createMap();
        map.put("foo", "bar");

        String expected = new Diger(new RawArgs(), CborSerializationUtil.serialize(map.getMap())).getQb64();

        String actual = factory.digestOf(map);

        assertEquals(expected, actual);
        assertTrue(actual.startsWith("E"));
    }
}
