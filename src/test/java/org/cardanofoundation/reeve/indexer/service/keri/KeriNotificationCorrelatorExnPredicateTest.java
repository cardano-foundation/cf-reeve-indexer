package org.cardanofoundation.reeve.indexer.service.keri;

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
import java.util.function.Predicate;

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

/**
 * The exn-predicate overload of {@link KeriNotificationCorrelator#awaitByRoute}: a route match alone
 * is not enough, the FETCHED exchange must also satisfy the caller's predicate (for a remotesign ref:
 * it answers OUR request). Runs the real correlator against a mocked {@code exchanges().get} returning
 * a typed {@link Exn}, so the typed-exn-to-map conversion is exercised too.
 */
class KeriNotificationCorrelatorExnPredicateTest {

    private static final String NOTE_ROUTE = "/exn/remotesign/ixn/ref";
    private static final String EXN_ROUTE = "/remotesign/ixn/ref";
    private static final String WALLET_AID = "EWALLETAID";
    private static final String AGENT_AID = "EAGENTAID";
    private static final String OUR_REQUEST_SAID = "EOURREQUESTSAID";
    private static final String OTHER_REQUEST_SAID = "EOTHERREQUESTSAID";

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

    private static Notification note(String id, String exnSaid) {
        return new Notification()
                .i(id)
                .dt("2026-09-29T00:00:00.000000+00:00")
                .r(false)
                .a(new NotificationData().r(NOTE_ROUTE).d(exnSaid).m(""));
    }

    private void listReturns(Notification... notes) throws Exception {
        List<Notification> list = new ArrayList<>(List.of(notes));
        when(notifications.list(anyInt(), anyInt())).thenReturn(
                new Notifying.Notifications.NotificationListResponse(0, list.size(), list.size(), list));
    }

    private void exchangeReturns(String said, String requestSaid, String sender, String recipient) throws Exception {
        when(exchanges.get(said)).thenReturn(Optional.of(new ExchangeResource()
                .exn(new Exn().v("KERI10JSON000000_").t("exn").d(said).i(sender).rp(recipient).p(requestSaid)
                        .dt("2026-09-29T00:00:00.000000+00:00").r(EXN_ROUTE).q(Map.of())
                        .a(Map.of("i", WALLET_AID)).e(Map.of()))));
    }

    private static Predicate<Map<String, Object>> answersOurRequest() {
        return exn -> EXN_ROUTE.equals(exn.get("r"))
                && OUR_REQUEST_SAID.equals(exn.get("p"))
                && WALLET_AID.equals(exn.get("i"))
                && AGENT_AID.equals(exn.get("rp"));
    }

    @Test
    void matchesRefForOurRequest() throws Exception {
        listReturns(note("n-ours", "EREFOURS"));
        exchangeReturns("EREFOURS", OUR_REQUEST_SAID, WALLET_AID, AGENT_AID);

        Optional<KeriNotificationCorrelator.CorrelatedNotification> claimed = correlator.awaitByRoute(
                List.of(NOTE_ROUTE), Duration.ofMillis(200), Set.of(), answersOurRequest());

        assertTrue(claimed.isPresent());
        assertEquals("n-ours", claimed.get().notificationId());
        assertEquals("EREFOURS", claimed.get().exnSaid());
    }

    @Test
    void skipsRefForOtherRequestAndLeavesItUnread() throws Exception {
        // The other request's ref comes FIRST: a route-only wait would claim it.
        listReturns(note("n-other", "EREFOTHER"), note("n-ours", "EREFOURS"));
        exchangeReturns("EREFOTHER", OTHER_REQUEST_SAID, WALLET_AID, AGENT_AID);
        exchangeReturns("EREFOURS", OUR_REQUEST_SAID, WALLET_AID, AGENT_AID);

        Optional<KeriNotificationCorrelator.CorrelatedNotification> claimed = correlator.awaitByRoute(
                List.of(NOTE_ROUTE), Duration.ofMillis(200), Set.of(), answersOurRequest());

        assertTrue(claimed.isPresent());
        assertEquals("n-ours", claimed.get().notificationId());
        verify(notifications, never()).mark(anyString());
        verify(notifications, never()).delete(anyString());
    }

    @Test
    void timesOutWhenOnlyRefsForOtherRequestsExistAndNeverMarksThem() throws Exception {
        listReturns(note("n-other", "EREFOTHER"));
        exchangeReturns("EREFOTHER", OTHER_REQUEST_SAID, WALLET_AID, AGENT_AID);

        Optional<KeriNotificationCorrelator.CorrelatedNotification> claimed = correlator.awaitByRoute(
                List.of(NOTE_ROUTE), Duration.ofMillis(50), Set.of(), answersOurRequest());

        assertFalse(claimed.isPresent());
        verify(notifications, never()).mark(anyString());
        verify(notifications, never()).delete(anyString());
    }

    @Test
    void skipsExchangeWhoseOwnSaidDiffersFromTheNotification() throws Exception {
        listReturns(note("n-forged", "ENOTESAID"));
        // Fetched exn claims a different SAID than the notification pointed at.
        when(exchanges.get("ENOTESAID")).thenReturn(Optional.of(new ExchangeResource()
                .exn(new Exn().d("ESOMETHINGELSE").i(WALLET_AID).rp(AGENT_AID).p(OUR_REQUEST_SAID)
                        .r(EXN_ROUTE).a(Map.of()).e(Map.of()))));

        Optional<KeriNotificationCorrelator.CorrelatedNotification> claimed = correlator.awaitByRoute(
                List.of(NOTE_ROUTE), Duration.ofMillis(50), Set.of(), answersOurRequest());

        assertFalse(claimed.isPresent());
    }

    @Test
    void conversionKeepsPIRp() throws Exception {
        listReturns(note("n-ours", "EREFOURS"));
        exchangeReturns("EREFOURS", OUR_REQUEST_SAID, WALLET_AID, AGENT_AID);
        List<Map<String, Object>> seen = new ArrayList<>();

        correlator.awaitByRoute(List.of(NOTE_ROUTE), Duration.ofMillis(200), Set.of(), exn -> {
            seen.add(exn);
            return true;
        });

        assertEquals(1, seen.size());
        assertEquals(OUR_REQUEST_SAID, seen.get(0).get("p"));
        assertEquals(WALLET_AID, seen.get(0).get("i"));
        assertEquals(AGENT_AID, seen.get(0).get("rp"));
        assertEquals(EXN_ROUTE, seen.get(0).get("r"));
        assertEquals("EREFOURS", seen.get(0).get("d"));
    }
}
