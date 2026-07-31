package org.cardanofoundation.reeve.indexer.service.keri;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

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
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.entity.IdentityEventEntity;
import org.cardanofoundation.reeve.indexer.model.entity.ReportEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CredentialRepository;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.model.repository.ReportRepository;
import org.cardanofoundation.reeve.indexer.service.keri.cesr.CESRStreamUtil;
import org.cardanofoundation.signify.app.clienting.SignifyClient;
import org.cardanofoundation.signify.generated.keria.model.KeyEvent;
import org.cardanofoundation.signify.generated.keria.model.KeyEventRecord;

@RequiredArgsConstructor
@Service
@Slf4j
public class KeriService {

    private final Optional<SignifyClient> client;
    private final KeriProperties keriProperties;
    private final CredentialSchemaRegistry credentialSchemaRegistry;
    private final AttestationPayloadSaidFactory payloadSaidFactory;
    @Value("${keri.enabled:false}")
    private boolean keriEnabled;
    private final ReportRepository reportRepository;
    private final DocumentRepository documentRepository;
    private final CredentialRepository credentialRepository;

    /**
     * OOBIs already resolved on this agent, so a resolve is not repeated on every verification.
     *
     * <p>Only SUCCESSES are recorded. A failed resolve must stay retryable — memoising it would pin a
     * transient network error, or a rotated OOBI, for the rest of the process lifetime and turn a
     * momentary blip into a permanently unverifiable schema.
     */
    private final Set<String> resolvedOobis = ConcurrentHashMap.newKeySet();

    private void resolveOobis() {
        for (String oobi : resolvableOobis()) {
            if (resolvedOobis.contains(oobi)) {
                continue;
            }
            client.ifPresent(c ->
            {
                try {
                    var completed = c.operations().wait(c.oobis().resolve(oobi, null));
                    // Reaching here means the operation completed without error: the current client
                    // raises OperationFailedException/OperationTimeoutException instead of returning a
                    // done-with-error operation, and those are caught below and left retryable.
                    if (completed != null) {
                        resolvedOobis.add(oobi);
                    }
                } catch (RuntimeException e) {
                    // Left OUT of resolvedOobis on purpose, so a transient failure stays retryable
                    // rather than pinning an issuer as unreachable for the process lifetime.
                    log.warn("Failed to resolve OOBI {} (will retry): {}", oobi, e.getMessage());
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
        List<KeyEventRecord> keyEvents = client.orElseThrow().keyEvents().get(identity.getIdentifier());
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
        KeyEvent kedEvent = keyEvents.get(index).getKed();
        if (kedEvent == null || !(kedEvent.getA() instanceof List<?> aList) || aList.isEmpty()) {
            log.info("KERI key event at index {} for {} carries no seals", index, identity.getIdentifier());
            return false;
        }
        Object first = aList.getFirst();
        if (first instanceof String a) {
            return a.equals(identity.getDataHash());
        } else if (first instanceof Map<?, ?> map) {
            // safely cast keys/values if you know they are String
            Object anchored = map.get("d");
            return identity.getDataHash() != null && identity.getDataHash().equals(anchored);
        } else {
            log.info("KERI identity event data hash is not a string: {}",
                    first != null ? first.getClass().getName() : "null");
            return false; // ensure all code paths return a boolean
        }
    }

    /**
     * Correlates a label-170 {@code ATTEST} event to whichever entity anchored the tx: a
     * {@code ReportEntity} (legacy REPORT/REPORT_V2 path) or a {@code DocumentEntity} (DOCUMENT
     * path, {@code DocumentProcessor}). Both get their {@code metadataHash} populated from the same
     * blake3 digest of the label-1447 datum ({@code ReeveMetadataStorage.saveAll}), so either can be
     * compared against the ATTEST's {@code dataHash} the same way. A tx is anchored by exactly one
     * of the two (its label-1447 {@code type} determines which repository has the row), so the
     * report lookup is tried first and the document lookup only on a report miss; if neither
     * matches, this is a no-op (as before this generalization, for an unmatched report).
     */
    public void verifyIdentityTx(IdentityEventEntity identityEntity) {
        if(!keriEnabled) {
            log.warn("KERI is not enabled. Skipping identity verification for txHash: {}", identityEntity.getTxHash());
            return;
        }
        Optional<ReportEntity> report = reportRepository.findByTxHash(identityEntity.getTxHash());
        if (report.isPresent()) {
            verifyAndSaveReport(report.get(), identityEntity);
            return;
        }
        documentRepository.findByTxHash(identityEntity.getTxHash())
                .ifPresent(document -> verifyAndSaveDocument(document, identityEntity));
    }

    private void verifyAndSaveReport(ReportEntity report, IdentityEventEntity identityEntity) {
        try {
            log.info("MetadataHash {} identiyEntityEventHash {}", report.getMetadataHash(), identityEntity.getDataHash());
            if (Objects.equals(report.getMetadataHash(), identityEntity.getDataHash())) {
                if (attestationGatePassed(identityEntity)) {
                    report.setIdentifier(identityEntity.getIdentifier());
                    report.setIdentityVerified(true);
                }
                reportRepository.save(report);
            }
        } catch (Exception e) {
            log.error("Error verifying identity for txHash: {}", identityEntity.getTxHash(), e);
        }
    }

    /**
     * Correlates a document with its ATTEST event by either of two contracts.
     *
     * <p>The FIRST is the long-standing one, unchanged: a backend-driven attestation anchors the digest
     * of the published label-1447 manifest, so {@code metadataHash} equals the ATTEST's {@code d}
     * directly. Every document anchored that way keeps verifying exactly as before — this check runs
     * first and nothing about it has moved.
     *
     * <p>The SECOND covers wallet-driven attestation. It anchors the digest of that SAME manifest — a
     * wallet can now derive it, since the manifest no longer carries anything decided at dispatch — but
     * seals the SAID of the remotesign payload WRAPPING that digest rather than the digest itself,
     * because a remotesign request has to be self-addressing. So the two contracts differ by exactly
     * one wrapping step; see {@link AttestationPayloadSaidFactory}.
     *
     * <p>Both are decidable from chain data alone, here and now. There used to be a third possibility —
     * "cannot say yet" — because the wallet attested a commitment covering the envelope's SHA-256,
     * which is not on chain and had to be fetched from IPFS first, deferring correlation. Nothing is
     * deferred any more.
     */
    private void verifyAndSaveDocument(DocumentEntity document, IdentityEventEntity identityEntity) {
        try {
            log.info("MetadataHash {} identiyEntityEventHash {}", document.getMetadataHash(), identityEntity.getDataHash());
            if (matchesAttestation(document, identityEntity)) {
                if (attestationGatePassed(identityEntity)) {
                    document.setIdentifier(identityEntity.getIdentifier());
                    document.setIdentityVerified(true);
                }
                documentRepository.save(document);
            }
        } catch (Exception e) {
            log.error("Error verifying identity for txHash: {}", identityEntity.getTxHash(), e);
        }
    }

    /** @return whether this ATTEST authorises this document under either contract (see above). */
    public boolean matchesAttestation(DocumentEntity document, IdentityEventEntity identityEntity) {
        if (Objects.equals(document.getMetadataHash(), identityEntity.getDataHash())) {
            return true;
        }
        String expectedPayloadSaid = payloadSaidFactory.expectedPayloadSaid(document.getMetadataHash(),
                identityEntity.getIdentifier());
        if (expectedPayloadSaid == null) {
            return false;
        }
        boolean matches = expectedPayloadSaid.equals(identityEntity.getDataHash());
        if (matches) {
            log.info("Document tx {} correlated via the wallet-anchored payload SAID {}",
                    document.getTxHash(), expectedPayloadSaid);
        }
        return matches;
    }

    /**
     * Shared ATTEST gate, used by both the report and document correlation paths: the
     * AID's KEL event at {@code seq} anchors the presented {@code dataHash} ({@link #verifyEvent})
     * AND a credential for the identifier is present and {@code valid} (set by
     * {@link #verifyCredentialEntity} on the prior AUTH_BEGIN).
     */
    private boolean attestationGatePassed(IdentityEventEntity identityEntity) throws Exception {
        boolean verifyEvent = verifyEvent(identityEntity);
        Optional<CredentialEntity> credential = credentialRepository.findById(identityEntity.getIdentifier());
        return verifyEvent && credential.isPresent() && Boolean.TRUE.equals(credential.get().getValid());
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
     *       a hard reject — this is the core multi-schema gate.</li>
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

            ParsedCesrChain parsed = parseCesrChain(cesrData, entity.getPrefixId());
            verifyRegistryEvents(parsed.vcpEvents(), parsed.vcpAttachments(), entity.getPrefixId());

            if (parsed.acdcBySaid().isEmpty()) {
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
            Map<String, Object> leaf = presentingAid != null
                    ? findByIssuee(parsed.acdcBySaid(), presentingAid, schema.said())
                    : null;
            if (leaf == null) {
                log.warn("no leaf ACDC of schema {} issued to {} found in chain for prefixId: {}",
                        schema.said(), presentingAid, entity.getPrefixId());
                entity.setValid(false);
                return;
            }

            boolean trustOk = schema.chained()
                    ? verifyChainedTrust(leaf, parsed.acdcBySaid(), schema, entity.getPrefixId())
                    : verifyStandaloneTrust(leaf, schema, parsed.issByCredentialSaid(), parsed.revokedCredentialSaids(),
                            entity.getPrefixId());

            entity.setValid(trustOk);
        } catch (Exception e) {
            log.warn("Credential verification failed for prefixId: {}, error: {}", entity.getPrefixId(), e.getMessage(), e);
            entity.setValid(false);
        }
    }

    /** The event/ACDC data {@link #verifyCredentialEntity} and {@link #readPresentedCredential}
     *  both need out of a parsed CESR chain — see {@link #parseCesrChain}. */
    private record ParsedCesrChain(
            List<Map<String, Object>> vcpEvents,
            List<String> vcpAttachments,
            Map<String, Map<String, Object>> acdcBySaid,
            Map<String, Map<String, Object>> issByCredentialSaid,
            Set<String> revokedCredentialSaids) {
    }

    /**
     * One pass over an already-parsed CESR event stream ({@link CESRStreamUtil#parseCESRData}),
     * bucketing every event by shape: {@code vcp} (registry inception, kept alongside its own
     * attachment for {@link #verifyRegistryEvents}), {@code iss}/{@code rev} (TEL issuance/
     * revocation, keyed by the credential SAID they govern), and ACDC-shaped events (keyed by their
     * own SAID). Extracted from {@link #verifyCredentialEntity} verbatim (same bucketing, same
     * per-event logging) so {@link #readPresentedCredential} (the card-attestation ceremony)
     * shares exactly the same parsing behavior rather than a second, potentially-diverging copy.
     *
     * <p>{@code readPresentedCredential} only consumes {@code acdcBySaid}; the TEL/registry buckets
     * are populated for {@link #verifyCredentialEntity}, which still verifies them.
     */
    @SuppressWarnings("unchecked")
    private ParsedCesrChain parseCesrChain(List<Map<String, Object>> cesrData, String logContext) {
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
                    log.debug("Skipping ACDC-shaped event with missing/blank 'd' (SAID) in chain for {}", logContext);
                }
            }
        }
        return new ParsedCesrChain(allVcpEvents, allVcpAttachments, acdcBySaid, issByCredentialSaid,
                revokedCredentialSaids);
    }

    /**
     * Verifies every registry inception ({@code vcp}) and credential issuance ({@code iss}) event in
     * the presented chain by finding it ANCHORED in its issuer's own key event log.
     *
     * <p>This replaces a {@code POST /registries/verify} call. That endpoint exists only on the
     * {@code feat/verifyCredential} branch of our KERIA fork and on the matching unmerged
     * {@code feat/verify} branch of signify-java; it is not in either upstream, and the deployed agent
     * answers 404. Nor is there an upstream substitute: an OOBI delivers only KEL events (verified
     * empirically — {@code icp}/{@code ixn}/{@code dip}/{@code rpy}, never {@code vcp} or {@code iss}),
     * KERIA populates TEL state only during an IPEX admit, and {@code /queries} takes a KEL prefix, not
     * a registry. So {@code credentials().state(ri, said)} answers 404 for any registry the agent has
     * not been walked through IPEX — which is every credential this indexer reads off the chain.
     *
     * <p>What IS available is the thing the TEL is secured by in the first place. Each TEL event is
     * anchored by a seal in the issuer's KEL, and the issuer's KEL is exactly what an OOBI delivers and
     * what KERIA verifies — signatures, witness receipts and all. Finding the event's SAID among those
     * seals proves the issuer committed to it, which is the property {@code /registries/verify} was
     * being asked for.
     *
     * <p>Anchoring is checked against the KEL of the AID the event itself names as controller
     * ({@code vcp.ii}), so a chain cannot nominate someone else's registry: the SAID has to appear in
     * the KEL of the AID that claims to have created it.
     *
     * @throws IllegalStateException when any event is not anchored, or its issuer's KEL cannot be read
     *         — an unanchored registry is not a registry we can attribute to anyone.
     */
    private void verifyRegistryEvents(List<Map<String, Object>> vcpEvents, List<String> vcpAttachments,
            String logContext) throws Exception {
        for (Map<String, Object> vcpEvent : vcpEvents) {
            String registrySaid = (String) vcpEvent.get("d");
            String registryId = (String) vcpEvent.get("i");
            String controller = (String) vcpEvent.get("ii");

            if (registrySaid == null || controller == null) {
                throw new IllegalStateException(
                        "Registry inception in chain for %s names no SAID or controller.".formatted(logContext));
            }
            // A registry's identifier IS the SAID of its inception event. A vcp claiming an id it does
            // not hash to is another registry's identifier with this event's contents written under it.
            if (registryId != null && !registryId.equals(registrySaid)) {
                throw new IllegalStateException(
                        "Registry inception for %s claims id %s but hashes to %s."
                                .formatted(logContext, registryId, registrySaid));
            }
            if (!isAnchoredInKel(controller, registrySaid)) {
                throw new IllegalStateException(
                        "Registry %s is not anchored in the key event log of its claimed controller %s (%s)."
                                .formatted(registrySaid, controller, logContext));
            }
            log.debug("Registry {} verified as anchored in {}'s KEL for {}", registrySaid, controller, logContext);
        }
    }

    /** @return whether {@code aid}'s KEL contains an event sealing {@code digest}. */
    private boolean isAnchoredInKel(String aid, String digest) throws Exception {
        for (KeyEventRecord record : client.orElseThrow().keyEvents().get(aid)) {
            KeyEvent event = record.getKed();
            if (event != null && sealsContain(event.getA(), digest)) {
                return true;
            }
        }
        return false;
    }

    /** Seals are an {@code a} list of {@code {i, s, d}} maps; {@code d} is what was committed to. */
    private static boolean sealsContain(Object sealField, String digest) {
        if (!(sealField instanceof List<?> seals)) {
            return false;
        }
        for (Object seal : seals) {
            if (seal instanceof Map<?, ?> map && digest.equals(map.get("d"))) {
                return true;
            }
        }
        return false;
    }

    /**
     * The presented leaf's own SAID, schema SAID, issuer AID and attribute claims — see
     * {@link #readPresentedCredential}. NONE of these has been verified against anything: they are
     * read off the chain exactly as presented.
     *
     * <p>{@code issuerAid} is the ACDC's own top-level {@code i} — who the credential SAYS issued it.
     * It is not evidence that they did, and in particular a self-issued credential names its own
     * holder here. {@code claims} is the attribute block {@code a} with the two structural keys
     * removed ({@code d}, the block's SAID; {@code i}, the issuee, which is the presenting AID the
     * caller already has; and {@code u}, the privacy salt) — what remains is the schema's own
     * attributes, whatever they are.
     * Both are for DISPLAY, so a person can see what was handed over; neither may gate anything.
     */
    public record PresentedCredential(String credentialSaid, String schemaSaid, String issuerAid,
            Map<String, Object> claims) {
    }

    /** The attribute block's structural keys — its own SAID, the issuee, and the privacy salt — as
     *  opposed to the schema's actual attributes. {@code u} is a blinding nonce, so showing it to a
     *  person would put a random string in the list looking exactly like a real claim. */
    private static final Set<String> STRUCTURAL_ATTRIBUTE_KEYS = Set.of("d", "i", "u");

    /** @return the leaf's schema attributes ({@code a} minus its structural keys), never null. */
    private static Map<String, Object> readClaims(Map<String, Object> leaf) {
        if (!(leaf.get("a") instanceof Map<?, ?> attributes)) {
            return Map.of();
        }
        Map<String, Object> claims = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : attributes.entrySet()) {
            if (entry.getKey() instanceof String key && !STRUCTURAL_ATTRIBUTE_KEYS.contains(key)) {
                claims.put(key, entry.getValue());
            }
        }
        return claims;
    }

    /**
     * Reads the identifiers of the credential a wallet presented in the card-attestation ceremony,
     * WITHOUT judging it.
     *
     * <p><b>This method deliberately performs no verification.</b> It replaced a trust check that
     * gated the presentation on the {@code vcp} registry events verifying, the schema being one of
     * the configured {@code keri.credential-schemas}, there being no second credential of the same
     * schema/issuee, the leaf not being revoked, and the schema's chained/standalone trust policy
     * (chain terminating at a trusted root AID, or a trusted issuer). The indexer is a
     * permissionless, public component and no longer makes any of those judgements: it records what
     * was presented and lets the importer decide whether to believe it. The platform's import
     * verifier is the gate that matters.
     *
     * <p>Consequently a self-issued, revoked, unknown-schema or entirely untrusted credential is
     * accepted here, and the {@code credentialSaid}/{@code schemaSaid} this returns — which end up
     * on the issued card — are CLAIMS, not verified facts. Any consumer treating them as verified is
     * relying on a guarantee this code does not provide.
     *
     * <p>{@code presentingAid} is used only to LOCATE the leaf in a multi-credential chain (which of
     * these ACDCs is the one the wallet just handed us), not as a trust check. The only failure mode
     * left is structural: if no credential for {@code presentingAid} can be parsed out of the chain
     * there is no SAID to record, and the caller must fail the step rather than invent one.
     *
     * <p>Never throws: a malformed chain or any unexpected exception is logged at WARN and reported
     * as {@link Optional#empty()} — this runs mid-ceremony, where a bad presentation must fail that
     * one ceremony step, not propagate past it.
     *
     * <p>Note that {@link #verifyCredentialEntity} — the on-chain AUTH_BEGIN identity-attestation
     * path — is unrelated to this method and still performs its full schema and trust checks.
     *
     * @param cesrData already-parsed CESR data ({@link CESRStreamUtil#parseCESRData}) — the caller
     *                 is responsible for parsing/decoding it into this shape from whatever raw or
     *                 hex-encoded chain source it has.
     * @return the presented leaf's own (credentialSaid, schemaSaid), or {@link Optional#empty()} if
     *         nothing parseable for {@code presentingAid} is in the chain.
     */
    public Optional<PresentedCredential> readPresentedCredential(String presentingAid,
            List<Map<String, Object>> cesrData, String logContext) {
        try {
            if (presentingAid == null) {
                log.warn("No presenting AID given for {}", logContext);
                return Optional.empty();
            }
            ParsedCesrChain parsed = parseCesrChain(cesrData, logContext);
            if (parsed.acdcBySaid().isEmpty()) {
                log.warn("No ACDC credential body found in presented chain for {}", logContext);
                return Optional.empty();
            }

            Map<String, Object> leaf = findByIssuee(parsed.acdcBySaid(), presentingAid);
            if (leaf == null) {
                log.warn("No credential issued to {} found in presented chain for {}", presentingAid, logContext);
                return Optional.empty();
            }

            String leafSaid = leaf.get("d") instanceof String d && !d.isBlank() ? d : null;
            if (leafSaid == null) {
                log.warn("Credential issued to {} has no usable SAID ('d') in presented chain for {}", presentingAid,
                        logContext);
                return Optional.empty();
            }
            // isAcdc() already required a non-null 's', so this is defensive against a non-String.
            String leafSchemaSaid = leaf.get("s") instanceof String s && !s.isBlank() ? s : null;

            // isAcdc() already required a non-null 'i', so this is defensive against a non-String.
            String leafIssuerAid = leaf.get("i") instanceof String i && !i.isBlank() ? i : null;

            log.info("accepting presented credential {} (schema {}) from {} for {} — not verified by the indexer",
                    leafSaid, leafSchemaSaid, presentingAid, logContext);
            return Optional.of(
                    new PresentedCredential(leafSaid, leafSchemaSaid, leafIssuerAid, readClaims(leaf)));
        } catch (Exception e) {
            log.warn("Reading the presented credential failed for {}: {}", logContext, e.getMessage(), e);
            return Optional.empty();
        }
    }

    /** Chained trust: the chain must terminate (walking {@code e} edges) at a trusted root AID.
     *  {@code logContext} is a free-form label for the WARN/DEBUG logging only — now always a
     *  credential's {@code prefixId} from {@link #verifyCredentialEntity}, its only remaining caller
     *  since the card-attestation ceremony stopped trust-checking presentations. */
    private boolean verifyChainedTrust(Map<String, Object> leaf, Map<String, Map<String, Object>> acdcBySaid,
            CredentialSchema schema, String logContext) {
        List<String> trustedRoots = blankFiltered(schema.trustedRoots());
        if (trustedRoots.isEmpty()) {
            // Fail CLOSED. A schema with no trusted roots is not "no restriction", it is a deployment
            // that has not said who it trusts — and the usual cause is a mis-templated ${VAR:} that
            // resolves to a blank entry and gets filtered away to nothing here. Accepting on structure
            // alone turned that typo into "trust every issuer on earth", silently.
            log.error("Schema {} is CHAINED but no trusted roots are configured (trusted-roots is empty or "
                    + "all blank — check for an unset environment variable). Rejecting: an empty trust list "
                    + "cannot mean trust anyone.", schema.said());
            return false;
        }
        String rootIssuer = terminalIssuerAid(leaf, acdcBySaid);
        boolean trusted = rootIssuer != null && trustedRoots.contains(rootIssuer);
        if (!trusted) {
            log.warn("Chained credential for schema {} did not terminate in a trusted root (resolved root issuer={}, context={})",
                    schema.said(), rootIssuer, logContext);
        }
        return trusted;
    }

    /** Standalone trust: the leaf's issuer AID must be a trusted issuer for this schema. See {@link
     *  #verifyChainedTrust}'s javadoc for {@code logContext}. */
    private boolean verifyStandaloneTrust(Map<String, Object> leaf, CredentialSchema schema,
            Map<String, Map<String, Object>> issByCredentialSaid, Set<String> revokedCredentialSaids,
            String logContext) {
        List<String> trustedIssuers = blankFiltered(schema.trustedIssuers());
        String leafIssuer = (String) leaf.get("i");
        boolean trusted;
        if (trustedIssuers.isEmpty()) {
            // Fail CLOSED, for the same reason as verifyChainedTrust above.
            log.error("Schema {} is STANDALONE but no trusted issuers are configured (trusted-issuers is "
                    + "empty or all blank — check for an unset environment variable). Rejecting: an empty "
                    + "trust list cannot mean trust anyone.", schema.said());
            trusted = false;
        } else {
            trusted = leafIssuer != null && trustedIssuers.contains(leafIssuer);
            if (!trusted) {
                log.warn("Standalone credential for schema {} issuer {} is not a trusted issuer (context={})",
                        schema.said(), leafIssuer, logContext);
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
            log.warn("Standalone credential {} for schema {} has been revoked (context={})",
                    leafSaid, schema.said(), logContext);
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

    /** Any-schema variant of {@link #findByIssuee(Map, String, String)} — used by {@link
     *  #readPresentedCredential} to DISCOVER which credential (of any schema) is issued to the
     *  presenting AID, since that method does not know the schema in advance the way {@link
     *  #verifyCredentialEntity} does. Only ever returns the FIRST chain-order match, which is
     *  sufficient there: that method locates a leaf to read identifiers off, it does not gate on it,
     *  so a second credential for the same AID is not an ambiguity anything acts on. */
    private static Map<String, Object> findByIssuee(Map<String, Map<String, Object>> acdcBySaid,
            String expectedIssueeAid) {
        for (Map<String, Object> acdc : acdcBySaid.values()) {
            if (expectedIssueeAid.equals(issuee(acdc))) {
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
