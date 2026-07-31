package org.cardanofoundation.reeve.indexer.service.keri;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.test.util.ReflectionTestUtils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.config.KeriProperties;
import org.cardanofoundation.signify.app.Exchanging;
import org.cardanofoundation.signify.app.Notifying;
import org.cardanofoundation.signify.app.clienting.SignifyClient;
import org.cardanofoundation.signify.generated.keria.model.ExchangeResource;
import org.cardanofoundation.signify.generated.keria.model.Exn;
import org.cardanofoundation.signify.generated.keria.model.Notification;
import org.cardanofoundation.signify.generated.keria.model.NotificationData;

/**
 * The clogged-agent case, which is how "the indexer stopped receiving notifications" actually
 * presents.
 *
 * <p>Notifications are deleted only when a step SUCCEEDS, so every abandoned or failed ceremony leaves
 * unread debris on the agent. This correlator used to read KERIA's FIRST PAGE only. Once the debris
 * filled that page, a genuine IPEX reply sat beyond it and was never claimed — the wallet reports the
 * credential as presented and this side never sees it, which is indistinguishable from a wallet that
 * never answered. It degrades with use rather than failing outright, which is exactly why reading one
 * page survived so long.
 */
class KeriNotificationCorrelatorTest {

    private static final String ROUTE = "/exn/ipex/grant";
    private static final String SENDER_AID = "ESENDERAID";
    private static final String WANTED_EXN_SAID = "EWANTEDEXNSAID";

    private SignifyClient signifyClient;
    private Notifying.Notifications notifications;
    private Exchanging.Exchanges exchanges;
    private KeriNotificationCorrelator correlator;

    @BeforeEach
    void setUp() {
        signifyClient = mock(SignifyClient.class);
        notifications = mock(Notifying.Notifications.class);
        exchanges = mock(Exchanging.Exchanges.class);
        when(signifyClient.notifications()).thenReturn(notifications);
        when(signifyClient.exchanges()).thenReturn(exchanges);

        correlator = new KeriNotificationCorrelator(Optional.of(signifyClient), new KeriProperties());
        ReflectionTestUtils.setField(correlator, "keriEnabled", true);
    }

    private static Notification note(String id, String route, String exnSaid) {
        return new Notification()
                .i(id)
                .dt("2026-07-31T00:00:00.000000+00:00")
                .r(false)
                .a(new NotificationData().r(route).d(exnSaid).m(""));
    }

    /** Debris: unread, but on a route nobody is waiting for. */
    private static List<Notification> debris(int count) {
        List<Notification> notes = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            notes.add(note("stale-" + i, "/exn/ipex/other", "ESTALE" + i));
        }

        return notes;
    }

    private static Notifying.Notifications.NotificationListResponse page(int start, int total,
            List<Notification> notes) {
        return new Notifying.Notifications.NotificationListResponse(start, start + notes.size(), total, notes);
    }

    @Test
    void claimsAReplyThatSitsBeyondTheFirstPageOfACloggedAgent() throws Exception {
        List<Notification> firstPage = debris(25);
        List<Notification> secondPage = new ArrayList<>(debris(3));
        secondPage.add(note("wanted", ROUTE, WANTED_EXN_SAID));

        when(notifications.list(0, 24)).thenReturn(page(0, 29, firstPage));
        when(notifications.list(25, 49)).thenReturn(page(25, 29, secondPage));
        when(exchanges.get(WANTED_EXN_SAID)).thenReturn(Optional.of(new ExchangeResource()
                .exn(new Exn().i(SENDER_AID).r(ROUTE).d(WANTED_EXN_SAID).a(Map.of()).e(Map.of()))));

        Optional<KeriNotificationCorrelator.CorrelatedNotification> claimed =
                correlator.awaitByRoute(List.of(ROUTE), Duration.ofSeconds(2));

        assertTrue(claimed.isPresent(), "a reply past the first page must still be claimed");
        assertEquals("wanted", claimed.get().notificationId());
        assertEquals(WANTED_EXN_SAID, claimed.get().exnSaid());
    }

    /** The single-page read this replaced: it must not go back to asking for only the default range. */
    @Test
    void listsByExplicitRangeRatherThanTheDefaultFirstPage() throws Exception {
        when(notifications.list(anyInt(), anyInt())).thenReturn(page(0, 0, List.of()));

        correlator.awaitByRoute(List.of(ROUTE), Duration.ofMillis(1));

        org.mockito.Mockito.verify(notifications, org.mockito.Mockito.atLeastOnce()).list(0, 24);
        org.mockito.Mockito.verify(notifications, org.mockito.Mockito.never()).list();
    }
}
