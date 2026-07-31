package org.cardanofoundation.reeve.indexer.service.card.attestation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.bloxbean.cardano.client.common.cbor.CborSerializationUtil;
import com.bloxbean.cardano.client.metadata.MetadataBuilder;
import com.bloxbean.cardano.client.metadata.MetadataMap;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.signify.cesr.Diger;
import org.cardanofoundation.signify.cesr.args.RawArgs;

/**
 * Small shape test for {@link Cip170MetadataFactory}, covering {@code digestOf} — the only method this
 * class still needs now that the card ceremony no longer publishes anything on-chain: {@code
 * attestMap} (which built the label-170 ATTEST map to submit) and {@code authBeginMap} have no
 * counterpart here.
 */
class Cip170MetadataFactoryTest {

    private final Cip170MetadataFactory factory = new Cip170MetadataFactory();

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
