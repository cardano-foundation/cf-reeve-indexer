package org.cardanofoundation.reeve.indexer.service.keri;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;

import org.cardanofoundation.signify.generated.keria.model.Exn;
import org.cardanofoundation.signify.generated.keria.model.KeyEvent;

/**
 * Pins the boundary where signify's typed models are projected back into the generic maps this
 * codebase reads events through.
 *
 * <p>Written after three of these went wrong at once in the move to signify main. Each was a place
 * that walked a raw {@code Object} and tested {@code instanceof Map}; against a typed return that
 * test never matches, so the code compiled cleanly and then did nothing — an empty KEL that reads as
 * "the wallet never signed", an exchange that reads as "no notification arrived". Silence, not
 * failure, which is the expensive kind.
 *
 * <p>What matters is the KEY NAMES: the projection must produce the wire form ({@code t}, {@code d},
 * {@code a}) and not Java field names, because every consumer indexes by the wire name.
 */
class SignifyModelProjectionTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Test
    void aKeyEventProjectsToItsWireFieldNames() {
        KeyEvent event = new KeyEvent();
        event.setT("ixn");
        event.setD("EEventSaid");
        event.setI("EIssuerAid");
        event.setS("3");
        event.setA(List.of(Map.of("i", "ERegistryId", "s", "0", "d", "EVcpSaid")));

        Map<String, Object> projected = MAPPER.convertValue(event, new TypeReference<>() {
        });

        assertEquals("ixn", projected.get("t"));
        assertEquals("EEventSaid", projected.get("d"));
        assertEquals("EIssuerAid", projected.get("i"));
        assertEquals("3", projected.get("s"));
        assertTrue(projected.get("a") instanceof List<?>, "seals must survive as a list");

        // The seal list is what anchor verification actually reads.
        List<?> seals = (List<?>) projected.get("a");
        assertTrue(seals.get(0) instanceof Map<?, ?>);
        assertEquals("EVcpSaid", ((Map<?, ?>) seals.get(0)).get("d"));
    }

    @Test
    void anExnProjectsToItsWireFieldNames() {
        Exn exn = new Exn();
        exn.setD("EExnSaid");
        exn.setR("/remotesign/ixn/ref");

        Map<String, Object> projected = MAPPER.convertValue(exn, new TypeReference<>() {
        });

        assertEquals("EExnSaid", projected.get("d"));
        assertEquals("/remotesign/ixn/ref", projected.get("r"));
    }
}
