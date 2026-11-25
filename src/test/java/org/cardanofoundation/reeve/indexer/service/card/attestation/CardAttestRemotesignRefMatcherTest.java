package org.cardanofoundation.reeve.indexer.service.card.attestation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.test.util.ReflectionTestUtils;

import id.veridian.signify.app.Exchanging;
import id.veridian.signify.app.Notifying;
import id.veridian.signify.app.clienting.SignifyClient;
import id.veridian.signify.generated.keria.model.ExchangeResource;
import id.veridian.signify.generated.keria.model.Exn;
import id.veridian.signify.generated.keria.model.Notification;
import id.veridian.signify.generated.keria.model.NotificationData;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.config.KeriProperties;
import org.cardanofoundation.reeve.indexer.service.keri.KeriNotificationCorrelator;
import org.cardanofoundation.reeve.indexer.service.keri.KeriNotificationCorrelator.CorrelatedNotification;

/**
 * The ATTEST step's remotesign ref match, run through the REAL correlator: a ref counts only when the
 * fetched exchange answers OUR request ({@code p}), comes from the paired wallet ({@code i}) and is
 * addressed to our agent ({@code rp}) — mirroring cip113's {@code matchesRemoteSignRef}.
 */
class CardAttestRemotesignRefMatcherTest {

    private static final String NOTE_ROUTE = "/exn/remotesign/ixn/ref";
    private static final String EXN_ROUTE = "/remotesign/ixn/ref";
    private static final String WALLET_AID = "EWALLETAID";
    private static final String AGENT_AID = "EAGENTAID";
    private static final String REQUEST_SAID = "EREQUESTSAID";

    private Notifying.Notifications notifications;
    private Exchanging.Exchanges exchanges;
    private KeriNotificationCorrelator correlator;

    @BeforeEach
    void setUp() {
        SignifyClient signifyClient = mock(SignifyClient.class);
        notifications = mock(Notifying.Notifications.class);
        exchanges = mock(Exchanging.Exchanges.class);
        when(signifyClient.notifications()).thenReturn(notifications);
        when(signifyClient.exchanges()).thenReturn(exchanges);

        KeriProperties properties = new KeriProperties();
        properties.setNotificationPollInterval(Duration.ofMillis(10));
        correlator = new KeriNotificationCorrelator(Optional.of(signifyClient), properties);
        ReflectionTestUtils.setField(correlator, "keriEnabled", true);
    }

    private void onlyRef(String exnSaid, String route, String p, String i, String rp) throws Exception {
        List<Notification> notes = new ArrayList<>(List.of(new Notification().i("n-" + exnSaid)
                .dt("2026-09-29T00:00:00.000000+00:00").r(false)
                .a(new NotificationData().r(NOTE_ROUTE).d(exnSaid).m(""))));
        when(notifications.list(anyInt(), anyInt())).thenReturn(
                new Notifying.Notifications.NotificationListResponse(0, 1, 1, notes));
        when(exchanges.get(exnSaid)).thenReturn(Optional.of(new ExchangeResource()
                .exn(new Exn().d(exnSaid).i(i).rp(rp).p(p).r(route).a(Map.of()).e(Map.of()))));
    }

    private Optional<CorrelatedNotification> await() {
        return correlator.awaitByRoute(List.of(NOTE_ROUTE), Duration.ofMillis(50), Set.of(),
                CardAttestService.remotesignRefMatcher(REQUEST_SAID, WALLET_AID, AGENT_AID));
    }

    @Test
    void claimsRefAnsweringOurRequest() throws Exception {
        onlyRef("EREF", EXN_ROUTE, REQUEST_SAID, WALLET_AID, AGENT_AID);

        Optional<CorrelatedNotification> claimed = await();

        assertTrue(claimed.isPresent());
        assertEquals("EREF", claimed.get().exnSaid());
    }

    @Test
    void ignoresRefForAnotherRequest() throws Exception {
        onlyRef("EREF", EXN_ROUTE, "EOLDERREQUEST", WALLET_AID, AGENT_AID);

        assertFalse(await().isPresent());
        verify(notifications, never()).mark(anyString());
        verify(notifications, never()).delete(anyString());
    }

    @Test
    void ignoresRefFromAnotherSender() throws Exception {
        onlyRef("EREF", EXN_ROUTE, REQUEST_SAID, "ESOMEONEELSE", AGENT_AID);

        assertFalse(await().isPresent());
    }

    @Test
    void ignoresRefAddressedToAnotherRecipient() throws Exception {
        onlyRef("EREF", EXN_ROUTE, REQUEST_SAID, WALLET_AID, "EOTHERAGENT");

        assertFalse(await().isPresent());
    }

    @Test
    void ignoresRefWithoutCorrelationFields() throws Exception {
        onlyRef("EREF", EXN_ROUTE, null, WALLET_AID, null);

        assertFalse(await().isPresent());
    }

    @Test
    void ignoresExchangeOnAnotherRoute() throws Exception {
        onlyRef("EREF", "/remotesign/ixn/req", REQUEST_SAID, WALLET_AID, AGENT_AID);

        assertFalse(await().isPresent());
    }
}
