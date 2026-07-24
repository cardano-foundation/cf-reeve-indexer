package org.cardanofoundation.reeve.indexer.service;

import java.io.IOException;
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
    private final DocumentRepository documentRepository;
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

    private void verifyAndSaveDocument(DocumentEntity document, IdentityEventEntity identityEntity) {
        try {
            log.info("MetadataHash {} identiyEntityEventHash {}", document.getMetadataHash(), identityEntity.getDataHash());
            if (Objects.equals(document.getMetadataHash(), identityEntity.getDataHash())) {
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

    /**
     * Shared ATTEST gate (design §C), used by both the report and document correlation paths: the
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

    /** The event/ACDC data {@link #verifyCredentialEntity} and {@link #validatePresentedCredentialChain}
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
     * per-event logging) so {@link #validatePresentedCredentialChain} (card-attestation ceremony,
     * design doc Part A / A4) shares exactly the same parsing behavior rather than a second,
     * potentially-diverging copy.
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

    /** Structurally verifies every {@code vcp} (registry inception) event against the live agent —
     *  extracted from {@link #verifyCredentialEntity} verbatim. Throws on any verification failure
     *  (mirrors the original inline loop, which relied on the caller's own outer try/catch); {@link
     *  #validatePresentedCredentialChain} wraps its own call in a try/catch instead, since it must
     *  never throw past its own boundary. */
    private void verifyRegistryEvents(List<Map<String, Object>> vcpEvents, List<String> vcpAttachments,
            String logContext) throws Exception {
        for (int i = 0; i < vcpEvents.size(); i++) {
            Map<String, Object> vcpEvent = vcpEvents.get(i);
            String vcpAttachment = vcpAttachments.get(i);
            Serder vcpSerder = new Serder(vcpEvent);

            RegistryVerifyOptions registryVerifyOptions = RegistryVerifyOptions.builder()
                    .vcp(vcpSerder)
                    .atc(vcpAttachment)
                    .build();

            Object registryVerifyOp = client.orElseThrow().registries().verify(registryVerifyOptions);

            client.orElseThrow().operations().wait(Operation.fromObject(registryVerifyOp));
            log.debug("VCP #{} verification completed successfully for {}", i + 1, logContext);
        }
    }

    /** The validated leaf's own SAID and schema SAID — see {@link #validatePresentedCredentialChain}. */
    public record ValidatedPresentedCredential(String credentialSaid, String schemaSaid) {
    }

    /**
     * Schema-aware chained/standalone trust check against an ALREADY-PARSED CESR chain — the core
     * logic shared between {@link #verifyCredentialEntity} (on-chain-observed AUTH_BEGIN credential
     * presentations, where the expected schema SAID is already known from the tx metadata) and the
     * card-attestation ceremony's {@code CardCredentialService} (design doc Part A / A4: a freshly
     * IPEX-admitted credential fetched from {@code client.credentials().get(said)}, whose schema is
     * NOT known in advance — a wallet may spontaneously present any schema this agent trusts, dual-
     * path grant included).
     *
     * <p>Unlike {@link #verifyCredentialEntity}'s own inline gate (which rejects BEFORE touching the
     * CESR at all, given a schema SAID already known from tx metadata), this method DISCOVERS the
     * schema from the chain itself: it locates whichever credential in the parsed chain is issued to
     * {@code presentingAid} (any schema — {@link #findByIssuee(Map, String)}, first match in chain
     * order), then gates that credential's OWN schema against {@link CredentialSchemaRegistry#forSaid}
     * — an unknown/unconfigured schema is a hard reject, exactly the same multi-schema gate {@code
     * verifyCredentialEntity} enforces, never weakened. It then explicitly scans for a SECOND,
     * DISTINCT credential also issued to {@code presentingAid} under that same schema ({@link
     * #hasAmbiguousMatch}) — real ambiguity protection: {@code findByIssuee} itself only ever returns
     * the FIRST chain-order match, so without this separate scan a submitter could smuggle a second,
     * differently-trusted credential of the same schema/issuee into the chain undetected. Finally
     * applies that schema's configured chained/standalone trust policy exactly as {@link
     * #verifyChainedTrust}/{@link #verifyStandaloneTrust} already do.
     *
     * <p><b>Strengthening beyond {@code verifyCredentialEntity}'s own asymmetry:</b> {@code
     * verifyCredentialEntity}'s chained branch ({@link #verifyChainedTrust}) does not check
     * revocation of the leaf at all today (only the standalone branch does). A freshly IPEX-admitted
     * credential has no other channel to have been screened for revocation before being accepted
     * into a ceremony, so this method checks the leaf's own revocation state unconditionally, for
     * BOTH chained and standalone schemas, before deferring to the schema's own trust check. This
     * only ever makes acceptance stricter, never weaker.
     *
     * <p>Never throws: every failure (an unknown schema, a missing/ambiguous leaf, a revoked leaf, a
     * failed structural {@code vcp} registry verification, an untrusted issuer/root, or any
     * unexpected exception) is logged at WARN and reported as {@link Optional#empty()} — this method
     * is called mid-ceremony, where a single bad presentation must fail that one ceremony step, not
     * propagate an exception past it.
     *
     * @param cesrData already-parsed CESR data ({@link CESRStreamUtil#parseCESRData}) — the caller
     *                 is responsible for parsing/decoding it into this shape from whatever raw or
     *                 hex-encoded chain source it has.
     * @return the validated leaf's own (credentialSaid, schemaSaid), or {@link Optional#empty()} on
     *         any rejection.
     */
    public Optional<ValidatedPresentedCredential> validatePresentedCredentialChain(String presentingAid,
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

            try {
                verifyRegistryEvents(parsed.vcpEvents(), parsed.vcpAttachments(), logContext);
            } catch (Exception e) {
                log.warn("Registry (vcp) verification failed for {}: {}", logContext, e.getMessage(), e);
                return Optional.empty();
            }

            Map<String, Object> leaf = findByIssuee(parsed.acdcBySaid(), presentingAid);
            if (leaf == null) {
                log.warn("No credential issued to {} found in presented chain for {}", presentingAid, logContext);
                return Optional.empty();
            }
            String leafSchemaSaid = (String) leaf.get("s");
            Optional<CredentialSchema> schemaOpt = credentialSchemaRegistry.forSaid(leafSchemaSaid);
            if (schemaOpt.isEmpty()) {
                log.warn("Unknown/unconfigured schema SAID {} presented by {} for {}", leafSchemaSaid,
                        presentingAid, logContext);
                return Optional.empty();
            }
            CredentialSchema schema = schemaOpt.get();
            String leafSaid = (String) leaf.get("d");

            // Real ambiguity check (findByIssuee only ever returns the FIRST chain-order match, so a
            // simple re-lookup can never itself detect a second candidate — see this method's javadoc):
            // reject if the presented chain contains a SECOND, DISTINCT credential of the SAME schema
            // also issued to presentingAid.
            if (hasAmbiguousMatch(parsed.acdcBySaid(), presentingAid, schema.said(), leafSaid)) {
                log.warn("Multiple distinct credentials of schema {} issued to {} found in presented chain for "
                        + "{} — ambiguous, rejecting", schema.said(), presentingAid, logContext);
                return Optional.empty();
            }

            if (parsed.revokedCredentialSaids().contains(leafSaid)) {
                log.warn("Presented credential {} (schema {}) has been revoked, rejecting for {}", leafSaid,
                        schema.said(), logContext);
                return Optional.empty();
            }

            boolean trustOk = schema.chained()
                    ? verifyChainedTrust(leaf, parsed.acdcBySaid(), schema, logContext)
                    : verifyStandaloneTrust(leaf, schema, parsed.issByCredentialSaid(), parsed.revokedCredentialSaids(),
                            logContext);
            if (!trustOk) {
                return Optional.empty();
            }
            return Optional.of(new ValidatedPresentedCredential(leafSaid, schema.said()));
        } catch (Exception e) {
            log.warn("Presented credential validation failed for {}: {}", logContext, e.getMessage(), e);
            return Optional.empty();
        }
    }

    /** Chained trust: the chain must terminate (walking {@code e} edges) at a trusted root AID.
     *  {@code logContext} is a free-form label for the WARN/DEBUG logging only (e.g. a credential's
     *  {@code prefixId} from {@link #verifyCredentialEntity}, or a ceremony id from {@code
     *  CardCredentialService}) — shared by both callers, see {@link #validatePresentedCredentialChain}. */
    private boolean verifyChainedTrust(Map<String, Object> leaf, Map<String, Map<String, Object>> acdcBySaid,
            CredentialSchema schema, String logContext) {
        List<String> trustedRoots = blankFiltered(schema.trustedRoots());
        if (trustedRoots.isEmpty()) {
            log.warn("no trusted roots configured for schema {}, accepting on structure alone", schema.said());
            return true;
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
            log.warn("no trusted issuers configured for schema {}, accepting on structure alone", schema.said());
            trusted = true;
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
     *  #validatePresentedCredentialChain} to DISCOVER which credential (of any schema) is issued to
     *  the presenting AID, since that method does not know the schema in advance the way {@link
     *  #verifyCredentialEntity} does. Only ever returns the FIRST chain-order match — it does NOT by
     *  itself detect (or rule out) a second, distinct credential also issued to the same AID; callers
     *  that need that guarantee must additionally check {@link #hasAmbiguousMatch}. */
    private static Map<String, Object> findByIssuee(Map<String, Map<String, Object>> acdcBySaid,
            String expectedIssueeAid) {
        for (Map<String, Object> acdc : acdcBySaid.values()) {
            if (expectedIssueeAid.equals(issuee(acdc))) {
                return acdc;
            }
        }
        return null;
    }

    /**
     * Real ambiguity check for {@link #validatePresentedCredentialChain}: {@code true} if the parsed
     * chain contains a credential OTHER than {@code excludeSaid} that is ALSO issued to {@code
     * expectedIssueeAid} under {@code expectedSchemaSaid}. {@link #findByIssuee} alone cannot detect
     * this — it only ever returns the first chain-order match — so this performs a separate,
     * exhaustive scan of every ACDC in the chain rather than re-deriving the same (necessarily
     * identical) first match a second time.
     */
    private static boolean hasAmbiguousMatch(Map<String, Map<String, Object>> acdcBySaid,
            String expectedIssueeAid, String expectedSchemaSaid, String excludeSaid) {
        for (Map.Entry<String, Map<String, Object>> entry : acdcBySaid.entrySet()) {
            if (entry.getKey().equals(excludeSaid)) {
                continue;
            }
            Map<String, Object> acdc = entry.getValue();
            if (expectedIssueeAid.equals(issuee(acdc)) && expectedSchemaSaid.equals(acdc.get("s"))) {
                return true;
            }
        }
        return false;
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
