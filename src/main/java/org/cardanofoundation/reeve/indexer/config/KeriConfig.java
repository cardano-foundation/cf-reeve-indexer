package org.cardanofoundation.reeve.indexer.config;

import java.net.URI;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.signify.app.aiding.CreateIdentifierArgs;
import org.cardanofoundation.signify.app.clienting.SignifyClient;
import org.cardanofoundation.signify.app.coring.Coring;
import org.cardanofoundation.signify.generated.keria.model.HabState;
import org.cardanofoundation.signify.generated.keria.model.KeyStateRecord;
import org.cardanofoundation.signify.generated.keria.model.Tier;

@Configuration
@ConditionalOnProperty(name = "keri.enabled", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
@Slf4j
public class KeriConfig {

    private final KeriProperties keriProperties;

    private record WitnessInfo(String eid, String oobi) {
    }

    private record AvailableWitnesses(int toad, List<WitnessInfo> witnesses) {
    }

    @Bean
    @ConditionalOnProperty(name = "keri.enabled", havingValue = "true", matchIfMissing = false)
    public SignifyClient signifyClient() throws Exception {
        log.info("Creating SignifyClient with URL: {}, Boot URL: {}", keriProperties.getUrl(), keriProperties.getBootUrl());
        String bran = resolveBran(keriProperties.getBran());
        SignifyClient client = new SignifyClient(keriProperties.getUrl(), bran, Tier.LOW, keriProperties.getBootUrl(), null);
        try {
            client.connect();
        } catch (Exception e) {
            client.boot();
            client.connect();
        }
        log.info("SignifyClient connected");
        for (String oobi : resolvableOobis()) {
            client.operations().wait(client.oobis().resolve(oobi, null));
        }
        return client;
    }

    /**
     * Resolves the KERIA passcode ({@code keri.bran}). A configured, non-empty bran is used
     * verbatim, giving the indexer's own KERI agent a STABLE identity across restarts (its
     * keystore and AID are deterministically derived from it). An empty bran falls back to an
     * EPHEMERAL {@link Coring#randomPasscode()} — a brand-new agent AID on every restart, which
     * breaks every existing Veridian wallet pairing so inbound IPEX notifications stop arriving.
     * That fallback is loudly warned so the misconfiguration is never silent.
     */
    static String resolveBran(String configuredBran) {
        if (configuredBran == null || configuredBran.isBlank()) {
            log.warn("CONFIG/SECURITY: keri.bran is not set — using an EPHEMERAL random passcode. "
                    + "The indexer's KERI agent identity will CHANGE on every restart, breaking existing "
                    + "Veridian wallet pairings and inbound IPEX notifications. Set KERI_BRAN to a stable, "
                    + "21-character value for any persistent deployment.");
            return Coring.randomPasscode();
        }
        return configuredBran;
    }

    /**
     * Get-or-create the indexer's own KERI agent AID (identity) under {@code keri.identifier-name},
     * WITH witnesses (see {@link #createAid}'s javadoc for why), plus the "agent" end-role. Exposed
     * as a {@link KeriAgentIdentity} bean so the rest of the app (e.g. the OOBI-exchange service)
     * never has to touch identifier creation itself.
     */
    @Bean
    public KeriAgentIdentity keriAgentIdentity(SignifyClient signifyClient) throws Exception {
        String identifierName = keriProperties.getIdentifierName();
        String prefix;

        Optional<HabState> habState = signifyClient.identifiers().get(identifierName);
        if (habState.isPresent()) {
            prefix = habState.get().getPrefix();
        } else {
            log.info("KERI agent identifier {} not found, creating a new one", identifierName);
            prefix = createAid(signifyClient, identifierName);
        }
        log.info("Using KERI agent identifier {} with prefix {}", identifierName, prefix);
        return new KeriAgentIdentity(prefix, identifierName);
    }

    static String createAid(SignifyClient client, String name) throws Exception {
        Object id;
        String eid;

        // Create the agent AID WITH witnesses (from the KERIA agent's own configured witness pool)
        // plus the "agent" end-role added below. The witnesses give the identifier a shared inbound
        // mailbox that any counterparty's KERIA can post to and poll — which is what lets a wallet
        // on a DIFFERENT KERIA deliver an IPEX offer/grant back to this AID so it surfaces in
        // notifications().list(). A witness-less AID's only inbound endpoint is this backend's own
        // KERIA agent, which a separate wallet-side KERIA deployment cannot necessarily deliver to:
        // in practice, a witness-less agent received no grants at all.
        AvailableWitnesses availableWitnesses = getAvailableWitnesses(client);
        List<String> witnessIds = availableWitnesses.witnesses().stream()
                .map(WitnessInfo::eid)
                .toList();

        CreateIdentifierArgs kArgs = CreateIdentifierArgs.builder().build();
        kArgs.setToad(availableWitnesses.toad());
        kArgs.setWits(witnessIds);

        Optional<HabState> optionalIdentifier = client.identifiers().get(name);
        if (optionalIdentifier.isPresent()) {
            id = optionalIdentifier.get().getPrefix();
        } else {
            client.operations().wait(client.identifiers().create(name, kArgs).op());
            // Read the prefix back off the identifier rather than out of the operation: the operation
            // types are now marker interfaces carrying only a name, and this is the same lookup the
            // already-exists branch above uses.
            id = client.identifiers().get(name)
                    .orElseThrow(() -> new IllegalStateException(
                            "Agent AID %s was created but cannot be read back.".formatted(name)))
                    .getPrefix();

            if (client.getAgent() != null && client.getAgent().getPre() != null) {
                eid = client.getAgent().getPre();
            } else {
                throw new IllegalStateException("Agent or pre is null");
            }
            if (!hasEndRole(client, name, "agent", eid)) {
                client.operations().wait(client.identifiers().addEndRole(name, "agent", eid, null).op());
            }

            // Diagnostic: log the freshly-created AID's actual witness set / toad so a live run can
            // confirm the witnesses were assigned (and see which ones), which is what the wallet's
            // KERIA must be able to reach to deliver a reply back.
            Optional<HabState> freshHab = client.identifiers().get(name);
            if (freshHab.isPresent()) {
                KeyStateRecord freshState = freshHab.get().getState();
                List<String> witnesses = freshState != null ? freshState.getB() : null;
                String toad = freshState != null ? freshState.getBt() : null;
                log.info("created agent AID {}: witnesses={} toad={}", id, witnesses, toad);
            } else {
                log.info("created agent AID {}: no HabState found immediately after creation", id);
            }
        }

        return id != null ? id.toString() : null;
    }

    static AvailableWitnesses getAvailableWitnesses(SignifyClient client) throws Exception {
        @SuppressWarnings("unchecked")
        Map<String, Object> config = (Map<String, Object>) new Coring.Config(client).get();

        @SuppressWarnings("unchecked")
        List<String> iurls = (List<String>) config.get("iurls");
        if (iurls == null) {
            throw new IllegalStateException("Agent configuration is missing iurls");
        }

        Map<String, WitnessInfo> witnessMap = new LinkedHashMap<>();
        for (String oobi : iurls) {
            try {
                // Parse-only, to skip malformed entries without failing startup.
                new URI(oobi).toURL();
                String[] parts = oobi.split("/oobi/");
                if (parts.length > 1) {
                    String eid = parts[1].split("/")[0];
                    witnessMap.putIfAbsent(eid, new WitnessInfo(eid, oobi));
                }
            } catch (Exception e) {
                log.warn("Error parsing witness OOBI URL {}: {}", oobi, e.getMessage());
            }
        }

        List<WitnessInfo> uniqueWitnesses = new ArrayList<>(witnessMap.values());
        int size = uniqueWitnesses.size();

        if (size >= 12) {
            return new AvailableWitnesses(8, uniqueWitnesses.subList(0, 12));
        }
        if (size >= 10) {
            return new AvailableWitnesses(7, uniqueWitnesses.subList(0, 10));
        }
        if (size >= 9) {
            return new AvailableWitnesses(6, uniqueWitnesses.subList(0, 9));
        }
        if (size >= 7) {
            return new AvailableWitnesses(5, uniqueWitnesses.subList(0, 7));
        }
        if (size >= 6) {
            return new AvailableWitnesses(4, uniqueWitnesses.subList(0, 6));
        }
        if (size > 0) {
            return new AvailableWitnesses(size, uniqueWitnesses.subList(0, size));
        }

        throw new IllegalStateException("Insufficient witnesses available");
    }

    static boolean hasEndRole(SignifyClient client, String alias, String role, String eid) throws Exception {
        List<Map<String, Object>> list = getEndRoles(client, alias, role);
        for (Map<String, Object> endRoleMap : list) {
            String endRole = (String) endRoleMap.get("role");
            String endRoleEid = (String) endRoleMap.get("eid");
            if (endRole != null && endRoleEid != null && endRole.equals(role) && endRoleEid.equals(eid)) {
                return true;
            }
        }
        return false;
    }

    static List<Map<String, Object>> getEndRoles(SignifyClient client, String alias, String role) throws Exception {
        String path = (role != null)
                ? "/identifiers/" + alias + "/endroles/" + role
                : "/identifiers/" + alias + "/endroles";

        HttpResponse<String> response = client.fetch(path, "GET", alias, null);
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.readValue(response.body(), new TypeReference<>() {
        });
    }

    /**
     * Union of every configured credential schema's OOBIs plus the legacy (deprecated)
     * {@code keri.oobis} list, de-duplicated and order-preserving.
     */
    private Set<String> resolvableOobis() {
        Set<String> oobis = new LinkedHashSet<>();
        if (keriProperties.getCredentialSchemas() != null) {
            keriProperties.getCredentialSchemas().forEach(schema -> {
                if (schema != null && schema.oobis() != null) {
                    oobis.addAll(schema.oobis());
                }
            });
        }
        if (keriProperties.getOobis() != null) {
            oobis.addAll(keriProperties.getOobis());
        }
        return oobis;
    }

}
