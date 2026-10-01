package org.cardanofoundation.reeve.indexer.service.card.attestation;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.*;

import java.time.Duration;
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
import id.veridian.signify.app.coring.Oobis;
import id.veridian.signify.app.coring.Operations;
import id.veridian.signify.app.credentialing.ipex.Ipex;
import id.veridian.signify.cesr.Serder;
import id.veridian.signify.generated.keria.model.CompletedExchangeOperation;
import id.veridian.signify.generated.keria.model.HabState;
import id.veridian.signify.generated.keria.model.Operation;
import id.veridian.signify.generated.keria.model.PendingOOBIOperation;
import org.mockito.InOrder;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.cardanofoundation.reeve.indexer.config.CredentialSchema;
import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.config.KeriAgentIdentity;
import org.cardanofoundation.reeve.indexer.config.KeriProperties;
import org.cardanofoundation.reeve.indexer.model.entity.CardAttestationCeremonyEntity;
import org.cardanofoundation.reeve.indexer.service.keri.KeriNotificationCorrelator;
import org.cardanofoundation.reeve.indexer.service.keri.KeriService;

/**
 * KERIA silently drops an IPEX exchange that references a schema SAID our own agent has never resolved,
 * so the wallet's reply would never arrive. Like the platform, the indexer resolves each configured
 * schema's OOBI ({@code <credential-schema-oobi-base-url>/<said>}) on its OWN agent before the apply.
 * The schema server is a third party, so an unreachable one is logged and retried on the next
 * presentation rather than blocking this one.
 */
class CardCredentialServiceSchemaOobiTest {

    private static final String SCHEMA = "ECONFIGUREDSCHEMA";
    private static final String BASE = "https://schemas.example/oobi/";
    private static final String AGENT_NAME = "reeve-agent";

    private final UUID ceremonyId = UUID.randomUUID();
    private Oobis oobis;
    private Exchanging.Exchanges exchanges;
    private CardCredentialService service;

    @BeforeEach
    void setUp() throws Exception {
        SignifyClient client = mock(SignifyClient.class);
        oobis = mock(Oobis.class);
        exchanges = mock(Exchanging.Exchanges.class);
        Notifying.Notifications notifications = mock(Notifying.Notifications.class);
        Ipex ipex = mock(Ipex.class);
        Operations operations = mock(Operations.class);
        IdentifierController identifiers = mock(IdentifierController.class);
        when(client.oobis()).thenReturn(oobis);
        when(client.exchanges()).thenReturn(exchanges);
        when(client.notifications()).thenReturn(notifications);
        when(client.ipex()).thenReturn(ipex);
        when(client.operations()).thenReturn(operations);
        when(client.identifiers()).thenReturn(identifiers);
        when(notifications.list(anyInt(), anyInt()))
                .thenReturn(new Notifying.Notifications.NotificationListResponse(0, 0, 0, List.of()));
        when(identifiers.get(AGENT_NAME)).thenReturn(Optional.of(new HabState()));
        when(oobis.resolve(anyString(), isNull())).thenReturn(new PendingOOBIOperation());
        Serder applyExn = mock(Serder.class);
        when(applyExn.getKed()).thenReturn(Map.of("d", "EAPPLYSAID"));
        when(exchanges.createExchangeMessage(any(), anyString(), any(), any(), anyString(), anyString(), any()))
                .thenReturn(new ExchangeMessageResult(applyExn, List.of(), ""));
        when(operations.wait(any(Operation.class))).thenReturn(new CompletedExchangeOperation().name("op"));
        when(operations.wait(any(Operation.class), any(Operations.WaitOptions.class)))
                .thenReturn(new CompletedExchangeOperation().name("op"));

        KeriProperties properties = new KeriProperties();
        properties.setNotificationPollInterval(Duration.ofMillis(10));
        properties.setWalletResponseTimeout(Duration.ofMillis(50));
        properties.setCredentialSchemaOobiBaseUrl(BASE);
        CredentialSchema schema = new CredentialSchema(SCHEMA, "configured", false, List.of(), List.of(), List.of());
        CredentialSchemaRegistry registry = mock(CredentialSchemaRegistry.class);
        when(registry.all()).thenReturn(List.of(schema));

        CardAttestationCeremonyEntity ceremony = CardAttestationCeremonyEntity.builder()
                .id(ceremonyId).walletAid("EWALLETAID").attemptGeneration(1).build();
        CardCeremonyService ceremonyService = mock(CardCeremonyService.class);
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

    @Test
    void resolvesTheSchemaOobiOnOurOwnAgentBeforeTheApply() throws Exception {
        service.presentCredential(ceremonyId, false);

        InOrder inOrder = inOrder(oobis, exchanges);
        inOrder.verify(oobis).resolve(BASE + SCHEMA, null);
        inOrder.verify(exchanges).createExchangeMessage(any(), eq("/ipex/apply"), any(), any(), anyString(),
                anyString(), any());
    }

    @Test
    void resolvesEachSchemaOobiOnlyOncePerProcess() throws Exception {
        service.presentCredential(ceremonyId, false);
        service.presentCredential(ceremonyId, true);

        verify(oobis, times(1)).resolve(BASE + SCHEMA, null);
    }

    @Test
    void anUnreachableSchemaServerDoesNotBlockThePresentationAndIsRetriedNextTime() throws Exception {
        when(oobis.resolve(eq(BASE + SCHEMA), isNull())).thenThrow(new IllegalStateException("503"));

        service.presentCredential(ceremonyId, false);
        service.presentCredential(ceremonyId, true);

        verify(exchanges, atLeastOnce()).createExchangeMessage(any(), eq("/ipex/apply"), any(), any(), anyString(),
                anyString(), any());
        verify(oobis, times(2)).resolve(BASE + SCHEMA, null);
    }
}
