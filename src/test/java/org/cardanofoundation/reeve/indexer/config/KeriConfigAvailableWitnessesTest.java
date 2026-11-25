package org.cardanofoundation.reeve.indexer.config;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.net.http.HttpResponse;

import id.veridian.signify.app.clienting.SignifyClient;

import org.junit.jupiter.api.Test;

/**
 * Witness selection for a NEW agent AID reads KERIA's {@code /config} through signify's
 * {@code Coring.Config}, which returns a typed {@code AgentConfig}. Casting it to a {@code Map}
 * threw a ClassCastException on the first boot against a KERIA account where the agent AID did not
 * exist yet, taking the whole indexer down (the platform's SignifyClientConfig already reads it typed).
 */
class KeriConfigAvailableWitnessesTest {

    @Test
    @SuppressWarnings("unchecked")
    void readsWitnessesFromTheTypedAgentConfig() throws Exception {
        SignifyClient client = mock(SignifyClient.class);
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.body()).thenReturn("""
                {"iurls": [
                  "https://witness-0.example/oobi/BW0/controller",
                  "https://witness-1.example/oobi/BW1/controller",
                  "https://witness-2.example/oobi/BW2/controller",
                  "https://witness-3.example/oobi/BW3/controller",
                  "https://witness-4.example/oobi/BW4/controller",
                  "https://witness-5.example/oobi/BW5/controller"
                ]}""");
        when(client.fetch(any(), eq("GET"), any())).thenAnswer(inv -> response);

        String selected = String.valueOf(KeriConfig.getAvailableWitnesses(client));

        // Six distinct witnesses select all six with a threshold of four.
        assertTrue(selected.contains("toad=4"), selected);
        assertTrue(selected.contains("BW0") && selected.contains("BW5"), selected);
    }
}
