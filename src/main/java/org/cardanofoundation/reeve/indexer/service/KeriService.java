package org.cardanofoundation.reeve.indexer.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.config.CredentialSchema;
import org.cardanofoundation.reeve.indexer.config.CredentialSchemaRegistry;
import org.cardanofoundation.reeve.indexer.config.KeriProperties;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.IdentityMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity;
import org.cardanofoundation.reeve.indexer.model.entity.IdentityEventEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CredentialRepository;
import org.cardanofoundation.reeve.indexer.model.repository.ReportRepository;
import org.cardanofoundation.signify.app.clienting.SignifyClient;
import org.cardanofoundation.signify.app.coring.Operation;
import org.cardanofoundation.signify.app.credentialing.registries.RegistryVerifyOptions;
import org.cardanofoundation.signify.cesr.Serder;
import org.cardanofoundation.signify.cesr.exceptions.LibsodiumException;
import org.cardanofoundation.signify.cesr.util.CESRStreamUtil;

@RequiredArgsConstructor
@Service
@Slf4j
public class KeriService {

    private final Optional<SignifyClient> client;
    private final KeriProperties keriProperties;
    private final CredentialSchemaRegistry credentialSchemaRegistry;
    @Value("${keri.enabled:false}")
    private boolean keriEnabled;
    private final ReportRepository reportRepository;
    private final CredentialRepository credentialRepository;

    private void resolveOobis() {
        for (String oobi : resolvableOobis()) {
            client.ifPresent(c ->
            {
                try {
                    Object object = c.oobis().resolve(oobi, null);
                    c.operations().wait(Operation.fromObject(object));
                } catch (LibsodiumException | IOException | InterruptedException e) {
                    log.warn("Failed to resolve OOBI {}: {}", oobi, e.getMessage());
                }
            });

        }
    }

    /**
     * Union of every configured credential schema's OOBIs plus the legacy (deprecated)
     * {@code keri.oobis} list, de-duplicated, order-preserving, and blank-filtered — env
     * placeholders left unset (e.g. {@code ${KERI_VLEI_OOBIS:}}) resolve to blank entries that
     * must never be handed to {@code client.oobis().resolve(...)}.
     */
    private Set<String> resolvableOobis() {
        Set<String> oobis = new LinkedHashSet<>();
        for (CredentialSchema schema : credentialSchemaRegistry.all()) {
            oobis.addAll(blankFiltered(schema.oobis()));
        }
        oobis.addAll(blankFiltered(keriProperties.getOobis()));
        return oobis;
    }

    private static List<String> blankFiltered(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream().filter(v -> v != null && !v.isBlank()).toList();
    }

    @SuppressWarnings("unchecked")
    public boolean verifyEvent(IdentityEventEntity identity) throws Exception {
        if(!keriEnabled) {
            log.warn("KERI is not enabled. Skipping identity verification for: {}", identity.getIdentifier());
            return false;
        }
        // TODO This is currently a workaround. KERIA needs some time to propagate these events.
        // The 5 seconds is an OK trade-off between speed and ensuring it is working
        resolveOobis();
        Thread.sleep(5000); // 5 seconds
        resolveOobis();
        // TODO will fix this when we are finalizing the identity demo
        List<Object> keyEvents = (List<Object>)client.orElseThrow().keyEvents().get(identity.getIdentifier());
        int index;
        try {
            index = Integer.parseUnsignedInt(identity.getSequenceNumber(), 16);
        } catch (NumberFormatException e) {
            log.error("Invalid hex sequence number: {}", identity.getSequenceNumber(), e);
            throw e;
        }
        if(keyEvents.size() <= index) {
            log.error("KERI key events do not contain index {} for identifier {}", index, identity.getIdentifier());
            return false;
        }
        Map<String, Object> kelEvent = (Map<String, Object>) keyEvents.get(index);
        Map<String, Object> kedEvent = (Map<String, Object>) kelEvent.get("ked");
        List<Object> aList = (List<Object>) kedEvent.get("a");
        Object first = aList.getFirst();
        if (first instanceof String a) {
            return a.equals(identity.getDataHash());
        } else if (first instanceof LinkedHashMap<?, ?> map) {
            // safely cast keys/values if you know they are String
            @SuppressWarnings("unchecked")
            LinkedHashMap<String, String> stringMap = (LinkedHashMap<String, String>) map;
            return stringMap.containsKey("d") && stringMap.get("d").equals(identity.getDataHash());
        } else {
            log.info("KERI identity event data hash is not a string: {}",
                    first != null ? first.getClass().getName() : "null");
            return false; // ensure all code paths return a boolean
        }
    }

    public void verifyIdentityTx(IdentityEventEntity identityEntity) {
        if(!keriEnabled) {
            log.warn("KERI is not enabled. Skipping identity verification for txHash: {}", identityEntity.getTxHash());
            return;
        }
        reportRepository.findByTxHash(identityEntity.getTxHash()).ifPresent(report -> {
            try {
                log.info("MetadataHash {} identiyEntityEventHash {}", report.getMetadataHash(), identityEntity.getDataHash());
                if(report.getMetadataHash().equals(identityEntity.getDataHash())) {
                    boolean verifyEvent = verifyEvent(identityEntity);
                    Optional<CredentialEntity> credential = credentialRepository.findById(identityEntity.getIdentifier());
                    if(verifyEvent && credential.isPresent() && Boolean.TRUE.equals(credential.get().getValid())) {
                        report.setIdentifier(identityEntity.getIdentifier());
                        report.setIdentityVerified(true);
                    }
                    reportRepository.save(report);
                }
            } catch (Exception e) {
                log.error("Error verifying identity for txHash: {}", identityEntity.getTxHash(), e);
            }
        });
    }

    /**
     * Schema-aware verification of a label-170 {@code AUTH_BEGIN} credential presentation.
     *
     * <p>Per-item isolation: every failure path — an unknown schema, a malformed/empty CESR
     * chain, a missing leaf credential, an untrusted issuer/root, or any unexpected exception —
     * sets {@code entity.setValid(false)} and returns rather than throwing, so one bad AUTH_BEGIN
     * in a block never aborts the surrounding metadata batch (mirrors the label-1447 processor's
     * per-item isolation in {@code ReeveMetadataStorage.handleReeveTxs}).
     *
     * <p>Control flow:
     * <ol>
     *   <li>Schema gate: {@code entity.getSchemaSaid()} must resolve via
     *       {@link CredentialSchemaRegistry#forSaid(String)}. Unknown/unconfigured schema SAID is
     *       a hard reject — this is the core multi-schema gate (design §B.1).</li>
     *   <li>Resolve OOBIs (union of every configured schema's OOBIs + legacy {@code keri.oobis}).</li>
     *   <li>Parse the CESR chain and verify every {@code vcp} (registry inception) event
     *       structurally via {@code registries().verify()}, as before.</li>
     *   <li>Locate the leaf ACDC — the credential in the chain issued to the presenting AID
     *       ({@code metadata.getI()}, {@code a.i} on the ACDC) <b>and</b> whose own schema
     *       ({@code s}) equals the gated schema SAID (matching on issuee alone would let a
     *       submitter smuggle in a different-schema credential under a lenient schema's trust
     *       policy).</li>
     *   <li>Trust check by {@code schema.chained()}:
     *     <ul>
     *       <li>chained: if {@code trustedRoots} (blank-filtered) is non-empty, the chain must
     *           terminate (walking {@code e} edges to a credential with no further edges) in one
     *           of them; empty trusted-roots accepts on structure alone (logged).</li>
     *       <li>standalone: if {@code trustedIssuers} (blank-filtered) is non-empty, the leaf's
     *           issuer ({@code i}) must be one of them; empty trusted-issuers accepts on structure
     *           alone (logged). Revocation is checked best-effort from whatever TEL {@code iss}/
     *           {@code rev} events are present in the parsed chain (see TODO(revocation) below).</li>
     *     </ul>
     *   </li>
     *   <li>{@code entity.setValid(...)} reflects the real outcome.</li>
     * </ol>
     *
     * <p>Persistence is unchanged: the caller ({@code ReeveMetadataStorage.handleIdentityTxs})
     * still persists {@code entity} after this call returns.
     */
    @SuppressWarnings("unchecked")
    public void verifyCredentialEntity(CredentialEntity entity, IdentityMetadata metadata) {
        try {
            String schemaSaid = entity.getSchemaSaid();
            Optional<CredentialSchema> schemaOpt = credentialSchemaRegistry.forSaid(schemaSaid);
            if (schemaOpt.isEmpty()) {
                log.warn("Unknown/unconfigured schema SAID {} for prefixId: {}", schemaSaid, entity.getPrefixId());
                entity.setValid(false);
                return;
            }
            CredentialSchema schema = schemaOpt.get();

            resolveOobis();

            String credentialChain = entity.getCredentialChain();
            ObjectMapper objectMapper = new ObjectMapper();
            List<String> chain = objectMapper.readValue(credentialChain, new TypeReference<List<String>>() {});
            List<String> list = chain.stream().map(this::parseHexString).toList();
            String fullAttachementString = String.join("", list);
            List<Map<String, Object>> cesrData = CESRStreamUtil.parseCESRData(fullAttachementString);
            if (cesrData.isEmpty()) {
                log.warn("Credential chain is empty for prefixId: {}", entity.getPrefixId());
                entity.setValid(false);
                return;
            }

            List<Map<String, Object>> allVcpEvents = new ArrayList<>();
            List<String> allVcpAttachments = new ArrayList<>();
            Map<String, Map<String, Object>> acdcBySaid = new LinkedHashMap<>();
            Map<String, Map<String, Object>> issByCredentialSaid = new HashMap<>();
            Set<String> revokedCredentialSaids = new HashSet<>();

            for (Map<String, Object> eventData : cesrData) {
                Map<String, Object> event = (Map<String, Object>) eventData.get("event");
                if (event == null) {
                    continue;
                }
                Object eventTypeObj = event.get("t");
                if (eventTypeObj != null) {
                    switch (eventTypeObj.toString()) {
                        case "vcp" -> {
                            allVcpEvents.add(event);
                            allVcpAttachments.add((String) eventData.get("atc"));
                        }
                        case "iss" -> issByCredentialSaid.put((String) event.get("i"), event);
                        // KERI TELs are append-only and revocation is terminal — presence
                        // anywhere in the stream is sufficient, stream order need not be checked.
                        case "rev" -> revokedCredentialSaids.add((String) event.get("i"));
                        default -> {
                            // icp/ixn/rot/... are irrelevant to credential-chain validation.
                        }
                    }
                } else if (isAcdc(event)) {
                    Object said = event.get("d");
                    if (said instanceof String saidStr && !saidStr.isBlank()) {
                        acdcBySaid.put(saidStr, event);
                    } else {
                        log.debug("Skipping ACDC-shaped event with missing/blank 'd' (SAID) in chain for prefixId: {}", entity.getPrefixId());
                    }
                }
            }

            for (int i = 0; i < allVcpEvents.size(); i++) {
                Map<String, Object> vcpEvent = allVcpEvents.get(i);
                String vcpAttachment = allVcpAttachments.get(i);
                Serder vcpSerder = new Serder(vcpEvent);

                RegistryVerifyOptions registryVerifyOptions = RegistryVerifyOptions.builder()
                        .vcp(vcpSerder)
                        .atc(vcpAttachment)
                        .build();

                Object registryVerifyOp = client.orElseThrow().registries().verify(registryVerifyOptions);

                client.orElseThrow().operations().wait(Operation.fromObject(registryVerifyOp));
                log.debug("VCP #{} verification completed successfully for prefixId: {}", i + 1, entity.getPrefixId());
            }

            if (acdcBySaid.isEmpty()) {
                log.warn("No ACDC credential body found in chain for prefixId: {}", entity.getPrefixId());
                entity.setValid(false);
                return;
            }

            String presentingAid = metadata != null && metadata.getI() != null ? metadata.getI() : entity.getPrefixId();
            // The leaf must match BOTH the presenting AID (a.i, issuee) AND the gated schema SAID
            // (the ACDC's own top-level `s`) — matching on issuee alone would let a submitter set
            // the tx metadata `s` to a lenient schema (e.g. one with empty trustedIssuers) while
            // embedding an ACDC of a *different* schema with a matching issuee, bypassing the
            // per-schema trust policy entirely.
            Map<String, Object> leaf = presentingAid != null ? findByIssuee(acdcBySaid, presentingAid, schema.said()) : null;
            if (leaf == null) {
                log.warn("no leaf ACDC of schema {} issued to {} found in chain for prefixId: {}",
                        schema.said(), presentingAid, entity.getPrefixId());
                entity.setValid(false);
                return;
            }

            boolean trustOk = schema.chained()
                    ? verifyChainedTrust(leaf, acdcBySaid, schema, entity)
                    : verifyStandaloneTrust(leaf, schema, issByCredentialSaid, revokedCredentialSaids, entity);

            entity.setValid(trustOk);
        } catch (Exception e) {
            log.warn("Credential verification failed for prefixId: {}, error: {}", entity.getPrefixId(), e.getMessage(), e);
            entity.setValid(false);
        }
    }

    /** Chained trust: the chain must terminate (walking {@code e} edges) at a trusted root AID. */
    private boolean verifyChainedTrust(Map<String, Object> leaf, Map<String, Map<String, Object>> acdcBySaid,
            CredentialSchema schema, CredentialEntity entity) {
        List<String> trustedRoots = blankFiltered(schema.trustedRoots());
        if (trustedRoots.isEmpty()) {
            log.warn("no trusted roots configured for schema {}, accepting on structure alone", schema.said());
            return true;
        }
        String rootIssuer = terminalIssuerAid(leaf, acdcBySaid);
        boolean trusted = rootIssuer != null && trustedRoots.contains(rootIssuer);
        if (!trusted) {
            log.warn("Chained credential for schema {} did not terminate in a trusted root (resolved root issuer={}, prefixId={})",
                    schema.said(), rootIssuer, entity.getPrefixId());
        }
        return trusted;
    }

    /** Standalone trust: the leaf's issuer AID must be a trusted issuer for this schema. */
    private boolean verifyStandaloneTrust(Map<String, Object> leaf, CredentialSchema schema,
            Map<String, Map<String, Object>> issByCredentialSaid, Set<String> revokedCredentialSaids,
            CredentialEntity entity) {
        List<String> trustedIssuers = blankFiltered(schema.trustedIssuers());
        String leafIssuer = (String) leaf.get("i");
        boolean trusted;
        if (trustedIssuers.isEmpty()) {
            log.warn("no trusted issuers configured for schema {}, accepting on structure alone", schema.said());
            trusted = true;
        } else {
            trusted = leafIssuer != null && trustedIssuers.contains(leafIssuer);
            if (!trusted) {
                log.warn("Standalone credential for schema {} issuer {} is not a trusted issuer (prefixId={})",
                        schema.said(), leafIssuer, entity.getPrefixId());
            }
        }
        if (!trusted) {
            return false;
        }

        // TODO(revocation): check TEL iss/rev state — this is only as reliable as the TEL events
        // actually present in the presented `c` chain payload. A `rev` event for the leaf is a
        // hard reject (revocation is terminal in KERI). The absence of an `iss` event is NOT
        // treated as a rejection: today's producers may not include a separate TEL issuance
        // anchoring event in this chain, so failing closed here would incorrectly reject
        // otherwise-valid, correctly-issued credentials. Revisit once the chain payload's TEL
        // coverage is confirmed end-to-end.
        String leafSaid = (String) leaf.get("d");
        if (revokedCredentialSaids.contains(leafSaid)) {
            log.warn("Standalone credential {} for schema {} has been revoked (prefixId={})",
                    leafSaid, schema.said(), entity.getPrefixId());
            return false;
        }
        if (!issByCredentialSaid.containsKey(leafSaid)) {
            log.debug("No TEL iss event found for leaf credential {} in parsed chain; issuance state unconfirmed", leafSaid);
        }
        return true;
    }

    /**
     * Walks {@code node} up through {@code e} (edges) to a credential with no further edges (the
     * root) and returns that root's issuer AID ({@code i}). Cycle-safe (a chain re-visiting a SAID
     * is treated as broken) and returns {@code null} if the chain cannot be fully resolved within
     * the presented CESR data (a missing parent, a cycle, or a multi-edge node — see below).
     *
     * <p>Linear-chain assumption: this only walks a single edge per level (root -> QVI -> LE ->
     * ...), matching this ecosystem's actual one-edge-per-level issuance chains. A node with
     * <em>more than one</em> substantive edge is a shape this walk cannot safely resolve — silently
     * following just one branch could let an untrusted branch's root escape the trust-root check —
     * so it is treated as unresolvable (logged, {@code null} returned) rather than partially walked.
     */
    private static String terminalIssuerAid(Map<String, Object> leaf, Map<String, Map<String, Object>> acdcBySaid) {
        Map<String, Object> current = leaf;
        Set<String> visited = new HashSet<>();
        while (true) {
            String said = (String) current.get("d");
            if (said == null || !visited.add(said)) {
                return null;
            }
            List<Map.Entry<String, Object>> edges = substantiveEdges(current);
            if (edges.isEmpty()) {
                return (String) current.get("i");
            }
            if (edges.size() > 1) {
                log.warn("Credential {} has {} substantive edges; multi-edge ancestry is not walked — "
                        + "rejecting trust-root resolution rather than silently following one branch.",
                        said, edges.size());
                return null;
            }
            Map<String, Object> edge = edges.get(0).getValue() instanceof Map<?, ?> m
                    ? (Map<String, Object>) m
                    : null;
            String parentSaid = edge != null ? (String) edge.get("n") : null;
            Map<String, Object> parent = parentSaid != null ? acdcBySaid.get(parentSaid) : null;
            if (parent == null) {
                return null;
            }
            current = parent;
        }
    }

    /** ACDCs carry no {@code "t"} (event-type) field — identified by having {@code s}/{@code a}/
     *  {@code i} instead. */
    private static boolean isAcdc(Map<String, Object> event) {
        return event.containsKey("s") && event.containsKey("a") && event.containsKey("i") && event.get("s") != null;
    }

    /**
     * The leaf ACDC must match both the presenting AID (issuee, {@code a.i}) and the schema being
     * gated on (the ACDC's own top-level {@code s}) — see the caller's comment for why matching on
     * issuee alone is a trust-policy bypass. If two ACDCs share the same issuee, only the one whose
     * schema matches is eligible.
     */
    private static Map<String, Object> findByIssuee(Map<String, Map<String, Object>> acdcBySaid,
            String expectedIssueeAid, String expectedSchemaSaid) {
        for (Map<String, Object> acdc : acdcBySaid.values()) {
            if (expectedIssueeAid.equals(issuee(acdc)) && expectedSchemaSaid.equals(acdc.get("s"))) {
                return acdc;
            }
        }
        return null;
    }

    private static String issuee(Map<String, Object> acdc) {
        Object a = acdc.get("a");
        return a instanceof Map<?, ?> am ? (String) am.get("i") : null;
    }

    /** The {@code e} (edges) map's own {@code d} entry is the edge block's own SAID, not an edge —
     *  every other entry is {@code {n: <parent credential SAID>, s: <parent schema SAID>, ...}}. */
    private static List<Map.Entry<String, Object>> substantiveEdges(Map<String, Object> acdc) {
        Object e = acdc.get("e");
        if (!(e instanceof Map<?, ?> em) || em.isEmpty()) {
            return List.of();
        }
        List<Map.Entry<String, Object>> result = new ArrayList<>();
        for (Map.Entry<?, ?> entry : em.entrySet()) {
            if (!"d".equals(entry.getKey())) {
                result.add(Map.entry((String) entry.getKey(), entry.getValue()));
            }
        }
        return result;
    }

    public String parseHexString(String hexString) {
        // Remove "0x" prefix if present
        String hex = hexString.startsWith("0x") ? hexString.substring(2) : hexString;

        // Convert hex to bytes
        byte[] bytes = new byte[hex.length() / 2];
        for (int i = 0; i < bytes.length; i++) {
            bytes[i] = (byte) Integer.parseInt(hex.substring(i * 2, i * 2 + 2), 16);
        }

        // Convert bytes to String
        return new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
    }
}
