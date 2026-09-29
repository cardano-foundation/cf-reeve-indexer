package org.cardanofoundation.reeve.indexer.service.card.attestation;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.test.util.ReflectionTestUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import id.veridian.signify.app.Exchanging;
import id.veridian.signify.app.Exchanging.ExchangeMessageResult;
import id.veridian.signify.app.Notifying;
import id.veridian.signify.app.aiding.IdentifierController;
import id.veridian.signify.app.clienting.SignifyClient;
import id.veridian.signify.app.coring.Operations;
import id.veridian.signify.app.credentialing.ipex.Ipex;
import id.veridian.signify.cesr.Serder;
import id.veridian.signify.generated.keria.model.CompletedExchangeOperation;
import id.veridian.signify.generated.keria.model.ExchangeResource;
import id.veridian.signify.generated.keria.model.Exn;
import id.veridian.signify.generated.keria.model.HabState;
import id.veridian.signify.generated.keria.model.Notification;
import id.veridian.signify.generated.keria.model.NotificationData;
import id.veridian.signify.generated.keria.model.Operation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.config.CredentialSchema;
import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.config.KeriAgentIdentity;
import org.cardanofoundation.reeve.indexer.config.KeriProperties;
import org.cardanofoundation.reeve.indexer.model.domain.ceremony.CardCeremonyState;
import org.cardanofoundation.reeve.indexer.model.entity.CardAttestationCeremonyEntity;
import org.cardanofoundation.reeve.indexer.service.keri.KeriNotificationCorrelator;
import org.cardanofoundation.reeve.indexer.service.keri.KeriService;

/**
 * A presented credential whose schema ({@code e.acdc.s}) is not one of the configured
 * {@code keri.credential-schemas} is never admitted, and its grant notification is cleaned up so the
 * NEXT presentation (of any ceremony — the agent's queue is shared) does not re-claim it.
 *
 * <p>Runs the real {@link KeriNotificationCorrelator} against an in-memory notification queue, so
 * "not re-claimed" is observed on the queue itself rather than assumed from a mock interaction.
 */
class CardCredentialServiceSchemaGuardTest {

    private static final String CONFIGURED_SCHEMA = "ECONFIGUREDSCHEMA";
    private static final String FOREIGN_SCHEMA = "EFOREIGNSCHEMA";
    private static final String WALLET_AID = "EWALLETAID";
    private static final String AGENT_NAME = "reeve-agent";
    private static final String GRANT_SAID = "EGRANTSAID";
    private static final String OFFER_SAID = "EOFFERSAID";

    private final UUID ceremonyId = UUID.randomUUID();
    private final List<Notification> queue = new ArrayList<>();

    private Notifying.Notifications notifications;
    private Exchanging.Exchanges exchanges;
    private Ipex ipex;
    private CardCeremonyService ceremonyService;
    private CardCredentialService service;

    @BeforeEach
    void setUp() throws Exception {
        SignifyClient client = mock(SignifyClient.class);
        notifications = mock(Notifying.Notifications.class);
        exchanges = mock(Exchanging.Exchanges.class);
        ipex = mock(Ipex.class);
        Operations operations = mock(Operations.class);
        IdentifierController identifiers = mock(IdentifierController.class);
        when(client.notifications()).thenReturn(notifications);
        when(client.exchanges()).thenReturn(exchanges);
        when(client.ipex()).thenReturn(ipex);
        when(client.operations()).thenReturn(operations);
        when(client.identifiers()).thenReturn(identifiers);

        // In-memory notification queue: list pages it, mark flags it read, delete removes it.
        when(notifications.list(anyInt(), anyInt())).thenAnswer(inv -> {
            List<Notification> snapshot = new ArrayList<>(queue);
            return new Notifying.Notifications.NotificationListResponse(0, snapshot.size(), snapshot.size(),
                    snapshot);
        });
        when(notifications.mark(anyString())).thenAnswer(inv -> {
            queue.stream().filter(n -> n.getI().equals(inv.getArgument(0))).forEach(n -> n.setR(true));
            return "";
        });
        doAnswer(inv -> queue.removeIf(n -> n.getI().equals(inv.getArgument(0))))
                .when(notifications).delete(anyString());

        when(identifiers.get(AGENT_NAME)).thenReturn(Optional.of(new HabState()));
        Serder applyExn = mock(Serder.class);
        when(applyExn.getKed()).thenReturn(Map.of("d", "EAPPLYSAID"));
        when(exchanges.createExchangeMessage(any(), anyString(), any(), any(), anyString(), anyString(), any()))
                .thenReturn(new ExchangeMessageResult(applyExn, List.of(), ""));
        when(ipex.agree(any())).thenReturn(new ExchangeMessageResult(applyExn, List.of(), "agree-atc"));
        when(operations.wait(org.mockito.ArgumentMatchers.<Operation>any())).thenReturn(new CompletedExchangeOperation().name("op"));

        KeriProperties properties = new KeriProperties();
        properties.setNotificationPollInterval(Duration.ofMillis(10));
        properties.setWalletResponseTimeout(Duration.ofMillis(150));

        CredentialSchema configured = new CredentialSchema(CONFIGURED_SCHEMA, "configured", false, List.of(),
                List.of(), List.of());
        CredentialSchemaRegistry registry = mock(CredentialSchemaRegistry.class);
        when(registry.all()).thenReturn(List.of(configured));
        when(registry.forSaid(CONFIGURED_SCHEMA)).thenReturn(Optional.of(configured));

        CardAttestationCeremonyEntity ceremony = CardAttestationCeremonyEntity.builder()
                .id(ceremonyId).walletAid(WALLET_AID).attemptGeneration(1).build();
        ceremonyService = mock(CardCeremonyService.class);
        when(ceremonyService.beginStep(eq(ceremonyId), any(), any(), any(Boolean.class))).thenReturn(ceremony);
        when(ceremonyService.updateWaitingStepData(eq(ceremonyId), anyInt(), any(), any())).thenReturn(true);
        when(ceremonyService.get(ceremonyId)).thenReturn(Optional.of(ceremony));

        KeriNotificationCorrelator correlator = new KeriNotificationCorrelator(Optional.of(client), properties);
        ReflectionTestUtils.setField(correlator, "keriEnabled", true);

        service = new CardCredentialService(Optional.of(client), Optional.of(new KeriAgentIdentity("EAGENTAID",
                AGENT_NAME)), mock(CardAttestationOobiService.class), correlator, ceremonyService, registry,
                mock(KeriService.class), properties, new ObjectMapper());
        ReflectionTestUtils.setField(service, "keriEnabled", true);
    }

    private void enqueue(String noteId, String route, String exnSaid, Exn exn) throws Exception {
        queue.add(new Notification().i(noteId).dt("2026-09-29T00:00:00.000000+00:00").r(false)
                .a(new NotificationData().r(route).d(exnSaid).m("")));
        when(exchanges.get(exnSaid)).thenReturn(Optional.of(new ExchangeResource().exn(exn)));
    }

    private void enqueueGrant(String schemaSaid) throws Exception {
        enqueue("n-grant", "/exn/ipex/grant", GRANT_SAID, new Exn().d(GRANT_SAID).i(WALLET_AID).r("/ipex/grant")
                .a(Map.of()).e(Map.of("acdc", Map.of("d", "ECREDENTIALSAID", "s", schemaSaid))));
    }

    @Test
    void rejectsGrantWithForeignSchemaBeforeAdmit() throws Exception {
        enqueueGrant(FOREIGN_SCHEMA);

        service.presentCredential(ceremonyId, false);

        verify(ipex, never()).admit(any());
        verify(ipex, never()).submitAdmit(anyString(), any(), any(), any(), any());
        verify(ceremonyService).failStep(eq(ceremonyId), eq(1), eq(CardCeremonyState.PAIRED),
                eq("CREDENTIAL_PRESENTATION_FAILED"), contains(FOREIGN_SCHEMA));
    }

    @Test
    void rejectsNegotiatedGrantWithForeignSchemaBeforeAdmit() throws Exception {
        enqueue("n-offer", "/exn/ipex/offer", OFFER_SAID, new Exn().d(OFFER_SAID).i(WALLET_AID).r("/ipex/offer")
                .a(Map.of()).e(Map.of()));
        enqueueGrant(FOREIGN_SCHEMA);

        service.presentCredential(ceremonyId, false);

        verify(ipex).agree(any());
        verify(ipex, never()).admit(any());
        verify(ceremonyService).failStep(eq(ceremonyId), eq(1), eq(CardCeremonyState.PAIRED),
                eq("CREDENTIAL_PRESENTATION_FAILED"), contains(FOREIGN_SCHEMA));
        assertTrue(queue.isEmpty(), "the rejected grant must be removed from the agent's queue");
    }

    @Test
    void rejectedGrantIsDeletedSoNextPresentationDoesNotReclaimIt() throws Exception {
        enqueueGrant(FOREIGN_SCHEMA);

        service.presentCredential(ceremonyId, false);

        verify(notifications).mark("n-grant");
        verify(notifications).delete("n-grant");
        assertTrue(queue.isEmpty(), "the rejected grant must be removed from the agent's queue");

        // The next presentation finds nothing to claim: it times out instead of re-claiming the grant.
        service.presentCredential(ceremonyId, false);

        verify(exchanges, times(1)).get(GRANT_SAID);
        verify(ipex, never()).admit(any());
        verify(ceremonyService).failStep(eq(ceremonyId), eq(1), eq(CardCeremonyState.PAIRED), eq("WALLET_TIMEOUT"),
                anyString());
    }

    @Test
    void admitsGrantWithConfiguredSchema() throws Exception {
        enqueueGrant(CONFIGURED_SCHEMA);

        service.presentCredential(ceremonyId, false);

        verify(ipex, atLeastOnce()).admit(any());
    }
}
