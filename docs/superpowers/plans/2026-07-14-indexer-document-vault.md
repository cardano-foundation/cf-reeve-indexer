# Indexer Document Vault Extension — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend cf-reeve-indexer into the independent verifier for published Document Vault documents (contract §9): index `type: DOCUMENT` label-1447 txs, run the five §9.3 checks, serve the public read API, issue key cards, and add frontend verification/decrypt/issuance views.

**Architecture:** Additive extension of the existing yaci-store pipeline (`ReeveMetadataStorage` → `ReeveMetadataDeserializer` → `ReeveTypeProcessor`). Verification is ingest-time + event-driven (publisher check via tx witness vkeys) + scheduled IPFS retry. Card issuance signs browser-generated public keys with a server-side Ed25519 issuer key. Frontend runs the §2.1/§2.6 crypto core entirely in the browser.

**Tech Stack:** Java 21 / Spring Boot 3.3.3 / yaci-store 0.1.6 / Postgres + Flyway / BouncyCastle 1.79 (transitive) / JUnit 5 + Mockito. Frontend: React 18 / Vite / MUI v7 / TanStack Query v5 / `@noble/curves` (new) / WebCrypto / Vitest.

**Spec:** `docs/superpowers/specs/2026-07-14-indexer-document-vault-design.md`. **Contract (frozen):** `docs/documentVault.md` — §2.1, §2.6, §2.7, §2.8, §9.

## Global Constraints

- **JDK 21**: every Gradle command runs as `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew …`.
- **No commits.** Repo owner commits manually (standing instruction). Do not run `git commit`; leave changes in the working tree. Task completion is tracked by checkboxes only.
- **The contract is frozen.** Field names, the §2.8.3 signing-input order, §2.1 constants, and error titles are copied exactly — never "improved".
- **Independence:** no code path may call Reeve's API or database. The only inputs are the chain (yaci-store) and IPFS (via `ipfs.gateway`).
- **No private keys server-side (I1/I5):** no request DTO, entity, or log may carry a private key. The issuance handler actively rejects smuggled key material.
- **JSON naming:** the Spring ObjectMapper is globally SNAKE_CASE. Document read-API views rely on that (snake_case on the wire). **Key-card JSON is camelCase per §2.8.2** — every card-facing DTO field MUST carry an explicit `@JsonProperty("camelCaseName")` so the global strategy cannot corrupt it.
- Backend tests: JUnit 5 + Mockito, plain unit tests (no Testcontainers), classes `XxxTest`, descriptive camelCase method names, package mirrors main. Run: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test --tests '<Class>'`.
- Frontend: follow `frontend/documentation/DEVELOPMENT.md` (naming, `.component.tsx`/`.styles.tsx`/`.types.ts`, absolute imports from `src`). Tests colocated `<name>.spec.ts(x)`, run `npm test` in `frontend/`.
- Hostile input is normal input: a malformed on-chain manifest must never throw out of a processor/listener (it would roll back the whole yaci block batch).
- Hex is lowercase everywhere; `content_hash`/`plaintext_hash` are 64 hex; `ephemeral_pub` 64 hex; `wrapped_dek` 96 hex; payload `nonce` 24 hex; ciphertext base64 (standard, padded).

---

### Task 1: `DOCUMENT` type, lenient deserialisation, slot propagation, org-null guard

**Files:**
- Modify: `src/main/java/org/cardanofoundation/reeve/indexer/model/domain/ReeveTransactionType.java`
- Modify: `src/main/java/org/cardanofoundation/reeve/indexer/model/domain/metadata/ReeveMetadata.java`
- Modify: `src/main/java/org/cardanofoundation/reeve/indexer/util/ReeveMetadataDeserializer.java`
- Modify: `src/main/java/org/cardanofoundation/reeve/indexer/yaci/ReeveMetadataStorage.java`
- Test: `src/test/java/org/cardanofoundation/reeve/indexer/util/ReeveMetadataDeserializerTest.java` (extend)

**Interfaces:**
- Produces: `ReeveTransactionType.DOCUMENT`; `ReeveMetadata.getSlot(): Long`; for `type: DOCUMENT`, `ReeveMetadata.getData()` is the **raw `com.fasterxml.jackson.databind.JsonNode`** of the manifest `data` section (may be null when absent) — Task 4's `DocumentProcessor` consumes it.

- [ ] **Step 1: Write the failing tests** — add to `ReeveMetadataDeserializerTest`:

```java
@Test
void documentTypeKeepsRawDataNode() throws Exception {
    String json = """
        {"type":"DOCUMENT","org":{"id":"aabb"},
         "metadata":{"version":"1.0"},
         "data":{"id":"doc-1","ipfs_cid":"bafy123","content_hash":"%s",
                 "plaintext_hash":"%s","envelope_version":1,"slot_count":2}}
        """.formatted("a".repeat(64), "b".repeat(64));
    ReeveMetadata metadata = new ObjectMapper().readValue(json, ReeveMetadata.class);
    assertEquals(ReeveTransactionType.DOCUMENT, metadata.getType());
    assertInstanceOf(JsonNode.class, metadata.getData());
    JsonNode data = (JsonNode) metadata.getData();
    assertEquals("doc-1", data.get("id").asText());
    assertEquals(2, data.get("slot_count").asInt());
}

@Test
void documentTypeWithGarbageDataStillDeserialises() throws Exception {
    String json = "{\"type\":\"DOCUMENT\",\"data\":\"not-an-object\"}";
    ReeveMetadata metadata = new ObjectMapper().readValue(json, ReeveMetadata.class);
    assertEquals(ReeveTransactionType.DOCUMENT, metadata.getType());
    assertNotNull(metadata.getData()); // raw node preserved for the processor to judge
}

@Test
void documentTypeWithMissingDataDeserialises() throws Exception {
    String json = "{\"type\":\"DOCUMENT\",\"org\":{\"id\":\"aabb\"}}";
    ReeveMetadata metadata = new ObjectMapper().readValue(json, ReeveMetadata.class);
    assertEquals(ReeveTransactionType.DOCUMENT, metadata.getType());
    assertNull(metadata.getData());
}
```

(Imports to add if missing: `com.fasterxml.jackson.databind.JsonNode`, `com.fasterxml.jackson.databind.ObjectMapper`, `org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType`, static `org.junit.jupiter.api.Assertions.*`.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test --tests 'org.cardanofoundation.reeve.indexer.util.ReeveMetadataDeserializerTest'`
Expected: FAIL — `Unknown transaction type: DOCUMENT`.

- [ ] **Step 3: Implement**

`ReeveTransactionType`: add `DOCUMENT` constant.

`ReeveMetadata`: add field `private Long slot;` (next to `txHash`).

`ReeveMetadataDeserializer` — in the `switch (type)`, before `default`:

```java
case DOCUMENT:
    // Deliberately lenient: validation happens in DocumentProcessor so a malformed
    // manifest still indexes as a MALFORMED_MANIFEST row (§9.3) instead of vanishing here.
    data = dataNode;
    break;
```

`ReeveMetadataStorage.saveAll` — after `rawMetadata.setTxHash(metadata.getTxHash());` add:

```java
rawMetadata.setSlot(metadata.getSlot());
```

`ReeveMetadataStorage.handleReeveTxs` — replace the unconditional org upsert at the top of the lambda with a null-guard (one hostile no-org tx must not NPE the whole block batch; org-scoped legacy branches are skipped, the processor still runs and records the malformed row):

```java
boolean hasOrg = rawMetadata.getOrg() != null && rawMetadata.getOrg().getId() != null;
if (hasOrg) {
    organisationRepository.saveIfNotExists(
            rawMetadata.getOrg().getId(),
            rawMetadata.getOrg().getName(), rawMetadata.getOrg().getCurrencyId(),
            rawMetadata.getOrg().getCountryCode(), rawMetadata.getOrg().getTaxIdNumber(),
            rawMetadata.getTxHash());
} else {
    log.warn("Label-1447 tx {} has no org section", rawMetadata.getTxHash());
}
processorRegistry.find(rawMetadata.getType())
        .ifPresent(processor -> processor.process(rawMetadata));
if (!hasOrg) {
    return; // legacy inline branches below are org-scoped
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test --tests 'org.cardanofoundation.reeve.indexer.util.ReeveMetadataDeserializerTest'`
Expected: PASS (all, including pre-existing tests).

---

### Task 2: Persistence — Flyway `V1.3`, enums, entities, repositories

**Files:**
- Create: `src/main/resources/db/store/postgresql/V1.3__add_documents.sql`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/domain/document/CheckStatus.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/domain/document/DocumentVerdict.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/entity/DocumentEntity.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/entity/TxSignerEntity.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/entity/IssuedCardEntity.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/repository/DocumentRepository.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/repository/TxSignerRepository.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/repository/IssuedCardRepository.java`
- Test: `src/test/java/org/cardanofoundation/reeve/indexer/model/domain/document/DocumentVerdictTest.java`

**Interfaces:**
- Produces: `CheckStatus { PASS, FAIL, PENDING }`; `DocumentVerdict { VERIFIED, MALFORMED_MANIFEST, PUBLISHER_UNKNOWN, IPFS_UNAVAILABLE, CONTENT_HASH_MISMATCH, MALFORMED_ENVELOPE, PENDING }` with `static DocumentVerdict compute(CheckStatus manifest, CheckStatus publisher, CheckStatus ipfs, CheckStatus contentHash, CheckStatus envelope)`; `DocumentEntity` (PK `txHash`, builder, fields listed below); repositories with the exact query methods below.

- [ ] **Step 1: Write the failing test**

```java
package org.cardanofoundation.reeve.indexer.model.domain.document;

import org.junit.jupiter.api.Test;

import static org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

class DocumentVerdictTest {

    @Test
    void allPassIsVerified() {
        assertEquals(DocumentVerdict.VERIFIED, DocumentVerdict.compute(PASS, PASS, PASS, PASS, PASS));
    }

    @Test
    void firstFailingCheckInContractOrderWins() {
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, DocumentVerdict.compute(FAIL, FAIL, FAIL, FAIL, FAIL));
        assertEquals(DocumentVerdict.PUBLISHER_UNKNOWN, DocumentVerdict.compute(PASS, FAIL, FAIL, FAIL, FAIL));
        assertEquals(DocumentVerdict.IPFS_UNAVAILABLE, DocumentVerdict.compute(PASS, PASS, FAIL, PENDING, PENDING));
        assertEquals(DocumentVerdict.CONTENT_HASH_MISMATCH, DocumentVerdict.compute(PASS, PASS, PASS, FAIL, PASS));
        assertEquals(DocumentVerdict.MALFORMED_ENVELOPE, DocumentVerdict.compute(PASS, PASS, PASS, PASS, FAIL));
    }

    @Test
    void pendingChecksWithoutFailureIsPending() {
        assertEquals(DocumentVerdict.PENDING, DocumentVerdict.compute(PASS, PENDING, PASS, PASS, PASS));
        assertEquals(DocumentVerdict.PENDING, DocumentVerdict.compute(PASS, PASS, PENDING, PENDING, PENDING));
    }

    @Test
    void aFailAfterPendingStillReports() {
        // publisher still pending but envelope already failed -> report the failure, not PENDING
        assertEquals(DocumentVerdict.MALFORMED_ENVELOPE, DocumentVerdict.compute(PASS, PENDING, PASS, PASS, FAIL));
    }
}
```

- [ ] **Step 2: Run to verify it fails** (class not found), same gradle test command pattern.

- [ ] **Step 3: Implement enums**

```java
package org.cardanofoundation.reeve.indexer.model.domain.document;

public enum CheckStatus { PASS, FAIL, PENDING }
```

```java
package org.cardanofoundation.reeve.indexer.model.domain.document;

/** Overall verdict per §9.3: first failing check in contract order wins; PENDING while unresolved. */
public enum DocumentVerdict {
    VERIFIED, MALFORMED_MANIFEST, PUBLISHER_UNKNOWN, IPFS_UNAVAILABLE,
    CONTENT_HASH_MISMATCH, MALFORMED_ENVELOPE, PENDING;

    public static DocumentVerdict compute(CheckStatus manifest, CheckStatus publisher,
            CheckStatus ipfs, CheckStatus contentHash, CheckStatus envelope) {
        if (manifest == CheckStatus.FAIL) return MALFORMED_MANIFEST;
        if (publisher == CheckStatus.FAIL) return PUBLISHER_UNKNOWN;
        if (ipfs == CheckStatus.FAIL) return IPFS_UNAVAILABLE;
        if (contentHash == CheckStatus.FAIL) return CONTENT_HASH_MISMATCH;
        if (envelope == CheckStatus.FAIL) return MALFORMED_ENVELOPE;
        if (manifest == CheckStatus.PASS && publisher == CheckStatus.PASS
                && ipfs == CheckStatus.PASS && contentHash == CheckStatus.PASS
                && envelope == CheckStatus.PASS) {
            return VERIFIED;
        }
        return PENDING;
    }
}
```

- [ ] **Step 4: Migration** — `V1.3__add_documents.sql`:

```sql
CREATE TABLE IF NOT EXISTS reeve_document
(
    tx_hash            varchar(64) PRIMARY KEY,
    document_id        varchar(255),
    organisation_id    varchar(64),
    ipfs_cid           varchar(255),
    content_hash       varchar(64),
    plaintext_hash     varchar(64),
    envelope_version   int,
    slot_count         int,
    slot               bigint,
    block_time         bigint,
    manifest_check     varchar(16) NOT NULL,
    publisher_check    varchar(16) NOT NULL,
    ipfs_check         varchar(16) NOT NULL,
    content_hash_check varchar(16) NOT NULL,
    envelope_check     varchar(16) NOT NULL,
    verdict            varchar(32) NOT NULL,
    ipfs_attempts      int         NOT NULL DEFAULT 0,
    ipfs_last_attempt  timestamp,
    raw                jsonb,
    created_at         timestamp   NOT NULL DEFAULT now(),
    updated_at         timestamp   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reeve_document_org ON reeve_document (organisation_id);
CREATE INDEX IF NOT EXISTS idx_reeve_document_document_id ON reeve_document (document_id);
CREATE INDEX IF NOT EXISTS idx_reeve_document_verdict ON reeve_document (verdict);

CREATE TABLE IF NOT EXISTS reeve_tx_signer
(
    tx_hash     varchar(64) PRIMARY KEY,
    slot        bigint,
    block_time  bigint,
    vkey_hashes text
);

CREATE TABLE IF NOT EXISTS reeve_issued_card
(
    card_id           uuid PRIMARY KEY,
    subject_type      varchar(16)  NOT NULL,
    subject_id        varchar(255) NOT NULL,
    display_name      varchar(255),
    email             varchar(255),
    organisation_id   varchar(64)  NOT NULL,
    public_key        varchar(64)  NOT NULL,
    label             varchar(255),
    assurance         varchar(16)  NOT NULL,
    created_at_signed varchar(40)  NOT NULL,
    issuer_id         varchar(255) NOT NULL,
    signature         varchar(128) NOT NULL,
    created_at        timestamp    NOT NULL DEFAULT now(),
    CONSTRAINT uq_issued_card UNIQUE (subject_id, organisation_id, public_key)
);
```

- [ ] **Step 5: Entities** (Lombok style mirrors `EventEntity`; reuse the existing `StringListConverter` for `vkeyHashes`):

```java
package org.cardanofoundation.reeve.indexer.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;

@Entity
@Table(name = "reeve_document")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentEntity {

    @Id
    @Column(name = "tx_hash")
    private String txHash;

    @Column(name = "document_id")
    private String documentId;
    @Column(name = "organisation_id")
    private String organisationId;
    @Column(name = "ipfs_cid")
    private String ipfsCid;
    @Column(name = "content_hash")
    private String contentHash;
    @Column(name = "plaintext_hash")
    private String plaintextHash;
    @Column(name = "envelope_version")
    private Integer envelopeVersion;
    @Column(name = "slot_count")
    private Integer slotCount;
    @Column(name = "slot")
    private Long slot;
    @Column(name = "block_time")
    private Long blockTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "manifest_check", nullable = false)
    private CheckStatus manifestCheck;
    @Enumerated(EnumType.STRING)
    @Column(name = "publisher_check", nullable = false)
    private CheckStatus publisherCheck;
    @Enumerated(EnumType.STRING)
    @Column(name = "ipfs_check", nullable = false)
    private CheckStatus ipfsCheck;
    @Enumerated(EnumType.STRING)
    @Column(name = "content_hash_check", nullable = false)
    private CheckStatus contentHashCheck;
    @Enumerated(EnumType.STRING)
    @Column(name = "envelope_check", nullable = false)
    private CheckStatus envelopeCheck;
    @Enumerated(EnumType.STRING)
    @Column(name = "verdict", nullable = false)
    private DocumentVerdict verdict;

    @Builder.Default
    @Column(name = "ipfs_attempts", nullable = false)
    private int ipfsAttempts = 0;
    @Column(name = "ipfs_last_attempt")
    private LocalDateTime ipfsLastAttempt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw")
    private String raw;

    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Builder.Default
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    /** Recomputes the overall verdict from the five per-check statuses. */
    public void recomputeVerdict() {
        this.verdict = DocumentVerdict.compute(manifestCheck, publisherCheck, ipfsCheck,
                contentHashCheck, envelopeCheck);
        this.updatedAt = LocalDateTime.now();
    }
}
```

```java
package org.cardanofoundation.reeve.indexer.model.entity;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;

import org.cardanofoundation.reeve.indexer.model.entity.converter.StringListConverter;

@Entity
@Table(name = "reeve_tx_signer")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TxSignerEntity {

    @Id
    @Column(name = "tx_hash")
    private String txHash;

    @Column(name = "slot")
    private Long slot;
    @Column(name = "block_time")
    private Long blockTime;

    /** blake2b-224 hashes (hex) of every vkey witness on the tx. */
    @Convert(converter = StringListConverter.class)
    @Column(name = "vkey_hashes")
    private List<String> vkeyHashes;
}
```

```java
package org.cardanofoundation.reeve.indexer.model.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

/** Registry of issued key cards — PUBLIC parts only (§9.4). No private-key column exists, ever. */
@Entity
@Table(name = "reeve_issued_card")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssuedCardEntity {

    @Id
    @Column(name = "card_id")
    private UUID cardId;

    @Column(name = "subject_type", nullable = false)
    private String subjectType;
    @Column(name = "subject_id", nullable = false)
    private String subjectId;
    @Column(name = "display_name")
    private String displayName;
    @Column(name = "email")
    private String email;
    @Column(name = "organisation_id", nullable = false)
    private String organisationId;
    @Column(name = "public_key", nullable = false)
    private String publicKey;
    @Column(name = "label")
    private String label;
    @Column(name = "assurance", nullable = false)
    private String assurance;
    /** The ISO-8601 instant signed into the card (field 11 of the signing input). */
    @Column(name = "created_at_signed", nullable = false)
    private String createdAtSigned;
    @Column(name = "issuer_id", nullable = false)
    private String issuerId;
    @Column(name = "signature", nullable = false)
    private String signature;

    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

- [ ] **Step 6: Repositories**

```java
package org.cardanofoundation.reeve.indexer.model.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;

public interface DocumentRepository extends JpaRepository<DocumentEntity, String> {

    Page<DocumentEntity> findByOrganisationId(String organisationId, Pageable pageable);

    Page<DocumentEntity> findByVerdict(DocumentVerdict verdict, Pageable pageable);

    Page<DocumentEntity> findByOrganisationIdAndVerdict(String organisationId,
            DocumentVerdict verdict, Pageable pageable);

    List<DocumentEntity> findByDocumentIdOrderBySlotAsc(String documentId);

    List<DocumentEntity> findByIpfsCheckAndManifestCheck(CheckStatus ipfsCheck,
            CheckStatus manifestCheck);

    List<DocumentEntity> findByPublisherCheckAndManifestCheck(CheckStatus publisherCheck,
            CheckStatus manifestCheck);
}
```

```java
package org.cardanofoundation.reeve.indexer.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.cardanofoundation.reeve.indexer.model.entity.TxSignerEntity;

public interface TxSignerRepository extends JpaRepository<TxSignerEntity, String> {
}
```

```java
package org.cardanofoundation.reeve.indexer.model.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;

public interface IssuedCardRepository extends JpaRepository<IssuedCardEntity, UUID> {

    Page<IssuedCardEntity> findByOrganisationId(String organisationId, Pageable pageable);

    Page<IssuedCardEntity> findBySubjectId(String subjectId, Pageable pageable);

    Optional<IssuedCardEntity> findBySubjectIdAndOrganisationIdAndPublicKey(String subjectId,
            String organisationId, String publicKey);
}
```

- [ ] **Step 7: Run tests + full compile**

Run: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test --tests 'org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdictTest' compileJava`
Expected: PASS.

---

### Task 3: Publisher check — allowlist, witness listener, resolver (§9.3 check 2)

**Files:**
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/service/document/PublisherAllowlist.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/service/document/DocumentPublisherResolver.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/yaci/TxSignerListener.java`
- Modify: `src/main/resources/application.yml` (add `indexer.publisher.addresses: ${PUBLISHER_ADDRESSES:}`)
- Test: `src/test/java/org/cardanofoundation/reeve/indexer/service/document/PublisherAllowlistTest.java`
- Test: `src/test/java/org/cardanofoundation/reeve/indexer/service/document/DocumentPublisherResolverTest.java`

**Interfaces:**
- Consumes: Task 2 entities/repos; `com.bloxbean.cardano.client.address.Address` (cardano-client-address 0.6.6, on classpath), `com.bloxbean.cardano.client.crypto.Blake2bUtil`, `com.bloxbean.cardano.client.util.HexUtil` — verify exact `Address#getPaymentCredentialHash()` signature with `javap` before use; adapt if the method name differs in 0.6.6.
- Produces: `PublisherAllowlist.isAllowedSigner(List<String> vkeyHashes): boolean` and `isEmpty(): boolean`; `DocumentPublisherResolver.resolve(String txHash): void` (idempotent — evaluates publisher check when both document row + signer row exist); `TxSignerListener` persisting `TxSignerEntity` for every label-1447 tx.

**Why witnesses:** an output to the organiser address is forgeable; witness vkeys are the keys that actually signed the tx. blake2b-224(vkey) == payment credential of an allowlisted address ⟺ the deployment's wallet signed.

- [ ] **Step 1: Write failing tests**

`PublisherAllowlistTest`:

```java
package org.cardanofoundation.reeve.indexer.service.document;

import java.util.List;

import org.junit.jupiter.api.Test;

import com.bloxbean.cardano.client.address.Address;
import com.bloxbean.cardano.client.crypto.Blake2bUtil;
import com.bloxbean.cardano.client.util.HexUtil;

import static org.junit.jupiter.api.Assertions.*;

class PublisherAllowlistTest {

    // Any syntactically valid mainnet base address works as fixture; its payment credential is
    // what the allowlist extracts. This is the well-known cardano-client-lib doc example address.
    private static final String ADDR =
            "addr1qxsq30awq9wu6dyl0so4pkllh9ttjfghlpvedcgqcm3lk8wtwhattr5r8ptt58gs9hy6ejr9pdjhpc2m9pyxlqjyxjcqz8xvhn";

    @Test
    void signerMatchingAllowlistedPaymentCredentialIsAllowed() {
        PublisherAllowlist allowlist = new PublisherAllowlist(List.of(ADDR));
        String credentialHex = HexUtil.encodeHexString(
                new Address(ADDR).getPaymentCredentialHash().orElseThrow());
        assertTrue(allowlist.isAllowedSigner(List.of("00".repeat(28), credentialHex)));
    }

    @Test
    void unknownSignerIsNotAllowed() {
        PublisherAllowlist allowlist = new PublisherAllowlist(List.of(ADDR));
        assertFalse(allowlist.isAllowedSigner(List.of("ab".repeat(28))));
    }

    @Test
    void emptyAllowlistAllowsNobody() {
        PublisherAllowlist allowlist = new PublisherAllowlist(List.of());
        assertTrue(allowlist.isEmpty());
        assertFalse(allowlist.isAllowedSigner(List.of("ab".repeat(28))));
    }

    @Test
    void malformedAddressFailsConstruction() {
        assertThrows(IllegalArgumentException.class,
                () -> new PublisherAllowlist(List.of("not-an-address")));
    }

    @Test
    void vkeyHashOfWitnessKeyMatchesPaymentCredential() {
        // Sanity-pin the mechanism itself: credential hash IS blake2b-224 of the payment vkey.
        byte[] fakeVkey = new byte[32];
        String hash = HexUtil.encodeHexString(Blake2bUtil.blake2bHash224(fakeVkey));
        assertEquals(56, hash.length());
    }
}
```

`DocumentPublisherResolverTest`:

```java
package org.cardanofoundation.reeve.indexer.service.document;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.entity.TxSignerEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.model.repository.TxSignerRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DocumentPublisherResolverTest {

    private DocumentRepository documentRepository;
    private TxSignerRepository txSignerRepository;
    private PublisherAllowlist allowlist;
    private DocumentPublisherResolver resolver;

    @BeforeEach
    void setUp() {
        documentRepository = mock(DocumentRepository.class);
        txSignerRepository = mock(TxSignerRepository.class);
        allowlist = mock(PublisherAllowlist.class);
        resolver = new DocumentPublisherResolver(documentRepository, txSignerRepository, allowlist);
    }

    private DocumentEntity pendingDoc(String txHash) {
        return DocumentEntity.builder()
                .txHash(txHash)
                .manifestCheck(CheckStatus.PASS)
                .publisherCheck(CheckStatus.PENDING)
                .ipfsCheck(CheckStatus.PENDING)
                .contentHashCheck(CheckStatus.PENDING)
                .envelopeCheck(CheckStatus.PENDING)
                .verdict(DocumentVerdict.PENDING)
                .build();
    }

    @Test
    void allowedSignerMarksPublisherPass() {
        DocumentEntity doc = pendingDoc("tx1");
        when(documentRepository.findById("tx1")).thenReturn(Optional.of(doc));
        when(txSignerRepository.findById("tx1")).thenReturn(Optional.of(
                TxSignerEntity.builder().txHash("tx1").blockTime(123L)
                        .vkeyHashes(List.of("aa")).build()));
        when(allowlist.isAllowedSigner(List.of("aa"))).thenReturn(true);

        resolver.resolve("tx1");

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertEquals(CheckStatus.PASS, captor.getValue().getPublisherCheck());
        assertEquals(123L, captor.getValue().getBlockTime());
    }

    @Test
    void unknownSignerMarksPublisherUnknown() {
        DocumentEntity doc = pendingDoc("tx1");
        when(documentRepository.findById("tx1")).thenReturn(Optional.of(doc));
        when(txSignerRepository.findById("tx1")).thenReturn(Optional.of(
                TxSignerEntity.builder().txHash("tx1").vkeyHashes(List.of("bb")).build()));
        when(allowlist.isAllowedSigner(List.of("bb"))).thenReturn(false);

        resolver.resolve("tx1");

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertEquals(CheckStatus.FAIL, captor.getValue().getPublisherCheck());
        assertEquals(DocumentVerdict.PUBLISHER_UNKNOWN, captor.getValue().getVerdict());
    }

    @Test
    void missingSignerRowLeavesPending() {
        when(documentRepository.findById("tx1")).thenReturn(Optional.of(pendingDoc("tx1")));
        when(txSignerRepository.findById("tx1")).thenReturn(Optional.empty());

        resolver.resolve("tx1");

        verify(documentRepository, never()).save(any());
    }

    @Test
    void alreadyResolvedDocumentIsNotTouched() {
        DocumentEntity doc = pendingDoc("tx1");
        doc.setPublisherCheck(CheckStatus.PASS);
        when(documentRepository.findById("tx1")).thenReturn(Optional.of(doc));
        when(txSignerRepository.findById("tx1")).thenReturn(Optional.of(
                TxSignerEntity.builder().txHash("tx1").vkeyHashes(List.of("aa")).build()));

        resolver.resolve("tx1");

        verify(documentRepository, never()).save(any());
    }
}
```

- [ ] **Step 2: Run to verify failure** (classes not found).

- [ ] **Step 3: Implement**

`PublisherAllowlist`:

```java
package org.cardanofoundation.reeve.indexer.service.document;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.bloxbean.cardano.client.address.Address;
import com.bloxbean.cardano.client.util.HexUtil;

/**
 * The configured publisher addresses (§9.5). "Publisher is known" (§9.3) means: a vkey that
 * actually SIGNED the anchoring tx hashes (blake2b-224) to the payment credential of one of
 * these addresses. This attests the deployment's platform wallet — NOT the organisation;
 * no per-org publishing key exists (contract §9.3, honest limit b).
 */
@Slf4j
@Component
public class PublisherAllowlist {

    private final Set<String> paymentCredentialHexes;

    public PublisherAllowlist(
            @Value("#{'${indexer.publisher.addresses:}'.split(',')}") List<String> addresses) {
        this.paymentCredentialHexes = addresses.stream()
                .map(String::trim)
                .filter(a -> !a.isEmpty())
                .map(a -> {
                    try {
                        return HexUtil.encodeHexString(
                                new Address(a).getPaymentCredentialHash().orElseThrow(
                                        () -> new IllegalArgumentException(
                                                "no payment credential in address " + a)));
                    } catch (RuntimeException e) {
                        // Fail startup: a deployment that believes it verifies publishers but
                        // does not is worse than one that refuses to boot (§9.5 philosophy).
                        throw new IllegalArgumentException(
                                "Malformed indexer.publisher.addresses entry: " + a, e);
                    }
                })
                .collect(Collectors.toSet());
        if (paymentCredentialHexes.isEmpty()) {
            log.warn("indexer.publisher.addresses is EMPTY - every DOCUMENT anchor will index "
                    + "as PUBLISHER_UNKNOWN");
        }
    }

    public boolean isAllowedSigner(List<String> vkeyHashes) {
        if (vkeyHashes == null || paymentCredentialHexes.isEmpty()) {
            return false;
        }
        return vkeyHashes.stream().anyMatch(paymentCredentialHexes::contains);
    }

    public boolean isEmpty() {
        return paymentCredentialHexes.isEmpty();
    }
}
```

`DocumentPublisherResolver`:

```java
package org.cardanofoundation.reeve.indexer.service.document;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.model.repository.TxSignerRepository;

/**
 * Bridges the two ingestion paths: metadata storage (document rows) and TransactionEvent
 * (signer rows) arrive in no guaranteed order, so BOTH call resolve() and whichever lands
 * second completes the publisher check. Idempotent.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentPublisherResolver {

    private final DocumentRepository documentRepository;
    private final TxSignerRepository txSignerRepository;
    private final PublisherAllowlist allowlist;

    public void resolve(String txHash) {
        documentRepository.findById(txHash).ifPresent(doc -> {
            if (doc.getPublisherCheck() != CheckStatus.PENDING) {
                return;
            }
            txSignerRepository.findById(txHash).ifPresent(signer -> {
                doc.setPublisherCheck(allowlist.isAllowedSigner(signer.getVkeyHashes())
                        ? CheckStatus.PASS : CheckStatus.FAIL);
                if (doc.getBlockTime() == null) {
                    doc.setBlockTime(signer.getBlockTime());
                }
                if (doc.getSlot() == null) {
                    doc.setSlot(signer.getSlot());
                }
                doc.recomputeVerdict();
                documentRepository.save(doc);
            });
        });
    }
}
```

`TxSignerListener`:

```java
package org.cardanofoundation.reeve.indexer.yaci;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import co.nstant.in.cbor.model.Map;
import co.nstant.in.cbor.model.UnsignedInteger;
import com.bloxbean.cardano.client.common.cbor.CborSerializationUtil;
import com.bloxbean.cardano.client.crypto.Blake2bUtil;
import com.bloxbean.cardano.client.util.HexUtil;
import com.bloxbean.cardano.yaci.core.model.VkeyWitness;
import com.bloxbean.cardano.yaci.helper.model.Transaction;
import com.bloxbean.cardano.yaci.store.events.TransactionEvent;

import org.cardanofoundation.reeve.indexer.model.entity.TxSignerEntity;
import org.cardanofoundation.reeve.indexer.model.repository.TxSignerRepository;
import org.cardanofoundation.reeve.indexer.service.document.DocumentPublisherResolver;

/**
 * Records who SIGNED every label-1447 transaction (blake2b-224 of each vkey witness), so the
 * publisher check (§9.3 check 2) can compare signers against the configured allowlist. Only
 * label-1447 txs are recorded to keep the table proportional to Reeve traffic.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TxSignerListener {

    @Value("${reeve.label}")
    private String reeveMetadataLabel;

    private final TxSignerRepository txSignerRepository;
    private final DocumentPublisherResolver publisherResolver;

    @EventListener
    @Transactional
    public void handle(TransactionEvent event) {
        for (Transaction tx : event.getTransactions()) {
            try {
                if (!carriesReeveLabel(tx)) {
                    continue;
                }
                List<String> vkeyHashes = tx.getWitnesses() == null
                        || tx.getWitnesses().getVkeyWitnesses() == null
                                ? List.of()
                                : tx.getWitnesses().getVkeyWitnesses().stream()
                                        .map(VkeyWitness::getKey)
                                        .filter(k -> k != null && !k.isBlank())
                                        .map(k -> HexUtil.encodeHexString(
                                                Blake2bUtil.blake2bHash224(
                                                        HexUtil.decodeHexString(k))))
                                        .toList();
                txSignerRepository.save(TxSignerEntity.builder()
                        .txHash(tx.getTxHash())
                        .slot(tx.getSlot())
                        .blockTime(event.getMetadata().getBlockTime())
                        .vkeyHashes(vkeyHashes)
                        .build());
                publisherResolver.resolve(tx.getTxHash());
            } catch (Exception e) {
                // Never let one hostile tx break the block batch.
                log.error("Failed to record signers for tx {}: {}", tx.getTxHash(),
                        e.getMessage());
            }
        }
    }

    private boolean carriesReeveLabel(Transaction tx) {
        if (tx.getAuxData() == null || tx.getAuxData().getMetadataCbor() == null) {
            return false;
        }
        try {
            Map metadataMap = (Map) CborSerializationUtil
                    .deserialize(HexUtil.decodeHexString(tx.getAuxData().getMetadataCbor()));
            return metadataMap.getKeys()
                    .contains(new UnsignedInteger(Long.parseLong(reeveMetadataLabel)));
        } catch (Exception e) {
            return false;
        }
    }
}
```

`application.yml` — under the existing `indexer`-level keys (create the block after `ipfs:`):

```yaml
indexer:
  publisher:
    addresses: ${PUBLISHER_ADDRESSES:}
```

- [ ] **Step 4: Run tests**

Run: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test --tests 'org.cardanofoundation.reeve.indexer.service.document.*'`
Expected: PASS. If `Address#getPaymentCredentialHash` does not exist under that name in 0.6.6, check with `javap -cp <cardano-client-address jar> com.bloxbean.cardano.client.address.Address` and use the equivalent accessor (e.g. `getPaymentCredential().map(Credential::getBytes)`); update `PublisherAllowlist` and the test fixture accordingly — the mechanism (payment credential bytes, hex-encoded) stays identical.

---

### Task 4: `DocumentProcessor` — manifest validation + index row (§9.2, §9.3 check 1)

**Files:**
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/processor/DocumentProcessor.java`
- Test: `src/test/java/org/cardanofoundation/reeve/indexer/processor/DocumentProcessorTest.java`

**Interfaces:**
- Consumes: `ReeveMetadata` (`getData()` is a raw `JsonNode` for DOCUMENT — Task 1), `DocumentRepository`, `TxSignerRepository` via `DocumentPublisherResolver.resolve(txHash)` (Task 3), enums (Task 2).
- Produces: one `DocumentEntity` row per DOCUMENT tx, `manifestCheck` PASS/FAIL, `verdict` recomputed; `DocumentEnvelopeVerifier` hook is added in Task 5 (this task leaves `ipfsCheck` PENDING).

Manifest `data` required fields (per spec §4): `id` (non-blank text), `ipfs_cid` (matches `^[a-zA-Z0-9]{10,128}$` — also prevents path traversal into the gateway URL), `content_hash` + `plaintext_hash` (`^[0-9a-f]{64}$`), `envelope_version` (int ≥ 1), `slot_count` (int ≥ 1). Any miss ⇒ `MALFORMED_MANIFEST` row (still indexed — that is the point of a verifier). Missing org section ⇒ `organisationId` null, manifest FAIL.

- [ ] **Step 1: Write failing tests**

```java
package org.cardanofoundation.reeve.indexer.processor;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.domain.Organisation;
import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.service.document.DocumentPublisherResolver;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DocumentProcessorTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private DocumentRepository documentRepository;
    private DocumentPublisherResolver publisherResolver;
    private DocumentProcessor processor;

    @BeforeEach
    void setUp() {
        documentRepository = mock(DocumentRepository.class);
        publisherResolver = mock(DocumentPublisherResolver.class);
        processor = new DocumentProcessor(documentRepository, publisherResolver);
        when(documentRepository.findById(any())).thenReturn(Optional.empty());
    }

    private ReeveMetadata metadata(String dataJson) throws Exception {
        ReeveMetadata metadata = new ReeveMetadata();
        metadata.setType(ReeveTransactionType.DOCUMENT);
        metadata.setTxHash("tx-doc-1");
        metadata.setSlot(4567L);
        Organisation org = new Organisation();
        org.setId("f".repeat(64));
        metadata.setOrg(org);
        if (dataJson != null) {
            metadata.setData(objectMapper.readTree(dataJson));
        }
        return metadata;
    }

    private static String validData() {
        return """
            {"id":"3fa85f64-5717-4562-b3fc-2c963f66afa6","ipfs_cid":"bafybeigdyrzt5examplecid",
             "content_hash":"%s","plaintext_hash":"%s","envelope_version":1,"slot_count":3}
            """.formatted("a".repeat(64), "b".repeat(64));
    }

    @Test
    void supportsDocumentType() {
        assertEquals(ReeveTransactionType.DOCUMENT, processor.supportedType());
    }

    @Test
    void validManifestIndexesWithManifestPassAndPendingChecks() throws Exception {
        processor.process(metadata(validData()));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        DocumentEntity entity = captor.getValue();
        assertEquals("tx-doc-1", entity.getTxHash());
        assertEquals("3fa85f64-5717-4562-b3fc-2c963f66afa6", entity.getDocumentId());
        assertEquals("f".repeat(64), entity.getOrganisationId());
        assertEquals("bafybeigdyrzt5examplecid", entity.getIpfsCid());
        assertEquals("a".repeat(64), entity.getContentHash());
        assertEquals("b".repeat(64), entity.getPlaintextHash());
        assertEquals(1, entity.getEnvelopeVersion());
        assertEquals(3, entity.getSlotCount());
        assertEquals(4567L, entity.getSlot());
        assertEquals(CheckStatus.PASS, entity.getManifestCheck());
        assertEquals(CheckStatus.PENDING, entity.getPublisherCheck());
        assertEquals(CheckStatus.PENDING, entity.getIpfsCheck());
        assertEquals(DocumentVerdict.PENDING, entity.getVerdict());
        verify(publisherResolver).resolve("tx-doc-1");
    }

    @Test
    void missingRequiredFieldIndexesAsMalformedManifest() throws Exception {
        processor.process(metadata("{\"id\":\"doc-1\",\"ipfs_cid\":\"bafyexamplecid1\"}"));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertEquals(CheckStatus.FAIL, captor.getValue().getManifestCheck());
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, captor.getValue().getVerdict());
    }

    @Test
    void invalidHashShapeIsMalformed() throws Exception {
        String bad = validData().replace("a".repeat(64), "ZZ".repeat(32));
        processor.process(metadata(bad));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, captor.getValue().getVerdict());
    }

    @Test
    void pathTraversalCidIsMalformed() throws Exception {
        String bad = validData().replace("bafybeigdyrzt5examplecid", "../../etc/passwd");
        // JSON-escaping: rebuild instead
        bad = """
            {"id":"doc-1","ipfs_cid":"../../etc","content_hash":"%s",
             "plaintext_hash":"%s","envelope_version":1,"slot_count":1}
            """.formatted("a".repeat(64), "b".repeat(64));
        processor.process(metadata(bad));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, captor.getValue().getVerdict());
    }

    @Test
    void missingDataNodeIsMalformed() throws Exception {
        processor.process(metadata(null));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, captor.getValue().getVerdict());
    }

    @Test
    void missingOrgIsMalformedButStillIndexed() throws Exception {
        ReeveMetadata metadata = metadata(validData());
        metadata.setOrg(null);
        processor.process(metadata);

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertNull(captor.getValue().getOrganisationId());
        assertEquals(DocumentVerdict.MALFORMED_MANIFEST, captor.getValue().getVerdict());
    }

    @Test
    void reprocessingSameTxOverwritesInsteadOfDuplicating() throws Exception {
        DocumentEntity existing = DocumentEntity.builder().txHash("tx-doc-1")
                .manifestCheck(CheckStatus.PASS).publisherCheck(CheckStatus.PASS)
                .ipfsCheck(CheckStatus.PASS).contentHashCheck(CheckStatus.PASS)
                .envelopeCheck(CheckStatus.PASS).verdict(DocumentVerdict.VERIFIED).build();
        when(documentRepository.findById("tx-doc-1")).thenReturn(Optional.of(existing));

        processor.process(metadata(validData()));

        ArgumentCaptor<DocumentEntity> captor = ArgumentCaptor.forClass(DocumentEntity.class);
        verify(documentRepository).save(captor.capture());
        assertEquals("tx-doc-1", captor.getValue().getTxHash()); // same PK -> upsert
    }

    @Test
    void processorNeverThrowsOnGarbage() throws Exception {
        ReeveMetadata metadata = new ReeveMetadata(); // everything null except type
        metadata.setType(ReeveTransactionType.DOCUMENT);
        metadata.setTxHash("tx-garbage");
        assertDoesNotThrow(() -> processor.process(metadata));
    }
}
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement**

```java
package org.cardanofoundation.reeve.indexer.processor;

import java.util.regex.Pattern;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;

import org.cardanofoundation.reeve.indexer.model.domain.ReeveTransactionType;
import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.metadata.ReeveMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.service.document.DocumentPublisherResolver;

/**
 * Indexes {@code type: DOCUMENT} manifests (contract §9.2). One row per anchoring tx; a manifest
 * that fails validation is still indexed, as MALFORMED_MANIFEST (§9.3 check 1) — a verifier that
 * silently drops bad input hides exactly what it exists to surface. Never throws: one hostile tx
 * must not roll back the yaci block batch.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentProcessor implements ReeveTypeProcessor {

    private static final Pattern HASH_64_HEX = Pattern.compile("^[0-9a-f]{64}$");
    // Also the SSRF/path-traversal guard: this string is later appended to the gateway URL.
    private static final Pattern CID_SHAPE = Pattern.compile("^[a-zA-Z0-9]{10,128}$");

    private final DocumentRepository documentRepository;
    private final DocumentPublisherResolver publisherResolver;

    @Override
    public ReeveTransactionType supportedType() {
        return ReeveTransactionType.DOCUMENT;
    }

    @Override
    public void process(ReeveMetadata metadata) {
        try {
            DocumentEntity entity = toEntity(metadata);
            documentRepository.save(entity);
            publisherResolver.resolve(entity.getTxHash());
        } catch (Exception e) {
            log.error("Failed to index DOCUMENT tx {}: {}", metadata.getTxHash(), e.getMessage());
        }
    }

    private DocumentEntity toEntity(ReeveMetadata metadata) {
        String organisationId =
                metadata.getOrg() != null ? metadata.getOrg().getId() : null;
        JsonNode data = metadata.getData() instanceof JsonNode node ? node : null;

        DocumentEntity.DocumentEntityBuilder builder = DocumentEntity.builder()
                .txHash(metadata.getTxHash())
                .organisationId(organisationId)
                .slot(metadata.getSlot())
                .raw(data != null ? data.toString() : null)
                .publisherCheck(CheckStatus.PENDING)
                .ipfsCheck(CheckStatus.PENDING)
                .contentHashCheck(CheckStatus.PENDING)
                .envelopeCheck(CheckStatus.PENDING);

        boolean valid = organisationId != null && data != null && data.isObject()
                && isNonBlankText(data.get("id"))
                && isText(data.get("ipfs_cid"), CID_SHAPE)
                && isText(data.get("content_hash"), HASH_64_HEX)
                && isText(data.get("plaintext_hash"), HASH_64_HEX)
                && isPositiveInt(data.get("envelope_version"))
                && isPositiveInt(data.get("slot_count"));

        if (data != null && data.isObject()) {
            builder.documentId(textOrNull(data.get("id")))
                    .ipfsCid(matchesOrNull(data.get("ipfs_cid"), CID_SHAPE))
                    .contentHash(matchesOrNull(data.get("content_hash"), HASH_64_HEX))
                    .plaintextHash(matchesOrNull(data.get("plaintext_hash"), HASH_64_HEX))
                    .envelopeVersion(intOrNull(data.get("envelope_version")))
                    .slotCount(intOrNull(data.get("slot_count")));
        }
        builder.manifestCheck(valid ? CheckStatus.PASS : CheckStatus.FAIL);

        DocumentEntity entity = builder.build();
        entity.recomputeVerdict();
        return entity;
    }

    private static boolean isNonBlankText(JsonNode node) {
        return node != null && node.isTextual() && !node.asText().isBlank();
    }

    private static boolean isText(JsonNode node, Pattern pattern) {
        return node != null && node.isTextual() && pattern.matcher(node.asText()).matches();
    }

    private static boolean isPositiveInt(JsonNode node) {
        return node != null && node.canConvertToInt() && node.asInt() >= 1;
    }

    private static String textOrNull(JsonNode node) {
        return node != null && node.isTextual() ? node.asText() : null;
    }

    private static String matchesOrNull(JsonNode node, Pattern pattern) {
        String text = textOrNull(node);
        return text != null && pattern.matcher(text).matches() ? text : null;
    }

    private static Integer intOrNull(JsonNode node) {
        return node != null && node.canConvertToInt() ? node.asInt() : null;
    }
}
```

- [ ] **Step 4: Run tests**

Run: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test --tests 'org.cardanofoundation.reeve.indexer.processor.DocumentProcessorTest'`
Expected: PASS. Note: `Organisation` setter usage in the test — if `Organisation` is immutable/builder-only, adapt fixture construction accordingly (check `model/domain/Organisation.java` first).

---

### Task 5: Envelope verification — IPFS fetch, content hash, envelope shape (§9.3 checks 3–5) + retry scheduler

**Files:**
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/service/document/DocumentEnvelopeVerifier.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/service/document/DocumentVerificationScheduler.java`
- Modify: `src/main/java/org/cardanofoundation/reeve/indexer/processor/DocumentProcessor.java` (call verifier after save)
- Modify: `src/main/java/org/cardanofoundation/reeve/indexer/ReeveIndexingExampleApplication.java` (add `@EnableScheduling`)
- Modify: `src/main/resources/application.yml` (add `indexer.verification.*` keys)
- Test: `src/test/java/org/cardanofoundation/reeve/indexer/service/document/DocumentEnvelopeVerifierTest.java`

**Interfaces:**
- Consumes: `IpfsGatewayClient.fetch(String): Optional<String>` (existing), `DocumentRepository`, enums.
- Produces: `DocumentEnvelopeVerifier.verify(DocumentEntity): void` (fetch + checks 4/5, mutates + saves the entity; increments `ipfsAttempts` on fetch failure, sets `ipfsCheck=FAIL` after `indexer.verification.ipfs-fail-after-attempts` (default 3) so the verdict becomes `IPFS_UNAVAILABLE`, but the scheduler keeps retrying — a later success flips it back). `DocumentVerificationScheduler` (fixed delay `indexer.verification.retry-interval-ms`, default 300000) re-runs the verifier for rows with `ipfsCheck != PASS && manifestCheck == PASS` and re-resolves publisher-PENDING rows.

Envelope validity (check 5), all required: JSON parses; `version` == manifest `envelope_version` and == 1 (only known version, I7); `type == "REEVE_ENCRYPTED_DOCUMENT"`; `org_id`, `content_hash`, `plaintext_hash` present and equal to the manifest values (self-consistency); `payload.ciphertext` valid standard base64; `payload.nonce` 24 hex; `slots` array with `slots.length == slot_count`, each slot `ephemeral_pub` 64 hex + `wrapped_dek` 96 hex. Check 4: `SHA-256(base64decode(ciphertext))` equals manifest `content_hash`; computed only when ciphertext decodes — an undecodable ciphertext is `MALFORMED_ENVELOPE` (check 5 FAIL, check 4 stays PENDING), never a fake `CONTENT_HASH_MISMATCH`.

- [ ] **Step 1: Write failing tests**

```java
package org.cardanofoundation.reeve.indexer.service.document;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.bloxbean.cardano.client.util.HexUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.processor.IpfsGatewayClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DocumentEnvelopeVerifierTest {

    private IpfsGatewayClient ipfsGatewayClient;
    private DocumentRepository documentRepository;
    private DocumentEnvelopeVerifier verifier;

    private static final byte[] CIPHERTEXT = "ciphertext-bytes".getBytes(StandardCharsets.UTF_8);

    @BeforeEach
    void setUp() {
        ipfsGatewayClient = mock(IpfsGatewayClient.class);
        documentRepository = mock(DocumentRepository.class);
        verifier = new DocumentEnvelopeVerifier(ipfsGatewayClient, documentRepository,
                new ObjectMapper(), 3);
    }

    private static String sha256Hex(byte[] bytes) throws Exception {
        return HexUtil.encodeHexString(MessageDigest.getInstance("SHA-256").digest(bytes));
    }

    private DocumentEntity doc(String contentHash, int slotCount) {
        return DocumentEntity.builder()
                .txHash("tx1").ipfsCid("bafyexamplecid1")
                .contentHash(contentHash).plaintextHash("b".repeat(64))
                .envelopeVersion(1).slotCount(slotCount)
                .organisationId("f".repeat(64))
                .manifestCheck(CheckStatus.PASS).publisherCheck(CheckStatus.PASS)
                .ipfsCheck(CheckStatus.PENDING).contentHashCheck(CheckStatus.PENDING)
                .envelopeCheck(CheckStatus.PENDING).verdict(DocumentVerdict.PENDING)
                .build();
    }

    private String envelope(String contentHash, int slots) {
        StringBuilder slotJson = new StringBuilder();
        for (int i = 0; i < slots; i++) {
            if (i > 0) slotJson.append(',');
            slotJson.append("{\"ephemeral_pub\":\"").append("c".repeat(64))
                    .append("\",\"wrapped_dek\":\"").append("d".repeat(96)).append("\"}");
        }
        return """
            {"version":1,"type":"REEVE_ENCRYPTED_DOCUMENT","org_id":"%s",
             "content_hash":"%s","plaintext_hash":"%s",
             "payload":{"ciphertext":"%s","nonce":"%s"},
             "slots":[%s]}
            """.formatted("f".repeat(64), contentHash, "b".repeat(64),
                Base64.getEncoder().encodeToString(CIPHERTEXT), "0".repeat(24), slotJson);
    }

    @Test
    void validEnvelopeVerifies() throws Exception {
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 2);
        when(ipfsGatewayClient.fetch("bafyexamplecid1"))
                .thenReturn(Optional.of(envelope(hash, 2)));

        verifier.verify(entity);

        assertEquals(CheckStatus.PASS, entity.getIpfsCheck());
        assertEquals(CheckStatus.PASS, entity.getContentHashCheck());
        assertEquals(CheckStatus.PASS, entity.getEnvelopeCheck());
        assertEquals(DocumentVerdict.VERIFIED, entity.getVerdict());
        verify(documentRepository).save(entity);
    }

    @Test
    void contentHashMismatchIsDetected() throws Exception {
        DocumentEntity entity = doc("9".repeat(64), 2); // on-chain hash != real hash
        when(ipfsGatewayClient.fetch("bafyexamplecid1"))
                .thenReturn(Optional.of(envelope("9".repeat(64), 2)));

        verifier.verify(entity);

        assertEquals(CheckStatus.FAIL, entity.getContentHashCheck());
        assertEquals(DocumentVerdict.CONTENT_HASH_MISMATCH, entity.getVerdict());
    }

    @Test
    void slotCountMismatchIsMalformedEnvelope() throws Exception {
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 5); // manifest says 5 slots, envelope has 2
        when(ipfsGatewayClient.fetch("bafyexamplecid1"))
                .thenReturn(Optional.of(envelope(hash, 2)));

        verifier.verify(entity);

        assertEquals(CheckStatus.PASS, entity.getContentHashCheck());
        assertEquals(CheckStatus.FAIL, entity.getEnvelopeCheck());
        assertEquals(DocumentVerdict.MALFORMED_ENVELOPE, entity.getVerdict());
    }

    @Test
    void unparseableEnvelopeIsMalformedNotMismatch() {
        DocumentEntity entity = doc("9".repeat(64), 2);
        when(ipfsGatewayClient.fetch("bafyexamplecid1"))
                .thenReturn(Optional.of("this is not json"));

        verifier.verify(entity);

        assertEquals(CheckStatus.PASS, entity.getIpfsCheck()); // it DID fetch
        assertEquals(CheckStatus.PENDING, entity.getContentHashCheck()); // never computed
        assertEquals(CheckStatus.FAIL, entity.getEnvelopeCheck());
        assertEquals(DocumentVerdict.MALFORMED_ENVELOPE, entity.getVerdict());
    }

    @Test
    void unknownEnvelopeVersionIsMalformed() throws Exception {
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 2);
        String v2 = envelope(hash, 2).replace("\"version\":1", "\"version\":2");
        when(ipfsGatewayClient.fetch("bafyexamplecid1")).thenReturn(Optional.of(v2));

        verifier.verify(entity);

        assertEquals(CheckStatus.FAIL, entity.getEnvelopeCheck()); // I7: never guess at unknown versions
    }

    @Test
    void fetchFailureStaysPendingUntilAttemptThreshold() {
        DocumentEntity entity = doc("9".repeat(64), 2);
        when(ipfsGatewayClient.fetch("bafyexamplecid1")).thenReturn(Optional.empty());

        verifier.verify(entity); // attempt 1
        assertEquals(CheckStatus.PENDING, entity.getIpfsCheck());
        assertEquals(1, entity.getIpfsAttempts());
        verifier.verify(entity); // attempt 2
        verifier.verify(entity); // attempt 3 -> threshold
        assertEquals(CheckStatus.FAIL, entity.getIpfsCheck());
        assertEquals(DocumentVerdict.IPFS_UNAVAILABLE, entity.getVerdict());
    }

    @Test
    void lateFetchSuccessRecoversFromIpfsUnavailable() throws Exception {
        String hash = sha256Hex(CIPHERTEXT);
        DocumentEntity entity = doc(hash, 2);
        entity.setIpfsCheck(CheckStatus.FAIL);
        entity.setIpfsAttempts(7);
        when(ipfsGatewayClient.fetch("bafyexamplecid1"))
                .thenReturn(Optional.of(envelope(hash, 2)));

        verifier.verify(entity);

        assertEquals(CheckStatus.PASS, entity.getIpfsCheck());
        assertEquals(DocumentVerdict.VERIFIED, entity.getVerdict());
    }
}
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement**

```java
package org.cardanofoundation.reeve.indexer.service.document;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.regex.Pattern;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bloxbean.cardano.client.util.HexUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.processor.IpfsGatewayClient;

/**
 * §9.3 checks 3-5. Check 4 (content hash) runs only when the ciphertext actually decodes —
 * an undecodable envelope is MALFORMED_ENVELOPE, never a fake CONTENT_HASH_MISMATCH.
 * IPFS failures are transient by nature: the verdict turns IPFS_UNAVAILABLE after
 * {@code failAfterAttempts}, but retries continue and a later success recovers the row.
 */
@Service
@Slf4j
public class DocumentEnvelopeVerifier {

    private static final Pattern HEX_24 = Pattern.compile("^[0-9a-f]{24}$");
    private static final Pattern HEX_64 = Pattern.compile("^[0-9a-f]{64}$");
    private static final Pattern HEX_96 = Pattern.compile("^[0-9a-f]{96}$");
    private static final String ENVELOPE_TYPE = "REEVE_ENCRYPTED_DOCUMENT";
    private static final int SUPPORTED_ENVELOPE_VERSION = 1;

    private final IpfsGatewayClient ipfsGatewayClient;
    private final DocumentRepository documentRepository;
    private final ObjectMapper objectMapper;
    private final int failAfterAttempts;

    public DocumentEnvelopeVerifier(IpfsGatewayClient ipfsGatewayClient,
            DocumentRepository documentRepository, ObjectMapper objectMapper,
            @Value("${indexer.verification.ipfs-fail-after-attempts:3}") int failAfterAttempts) {
        this.ipfsGatewayClient = ipfsGatewayClient;
        this.documentRepository = documentRepository;
        this.objectMapper = objectMapper;
        this.failAfterAttempts = failAfterAttempts;
    }

    public void verify(DocumentEntity entity) {
        try {
            if (entity.getManifestCheck() != CheckStatus.PASS || entity.getIpfsCid() == null) {
                return; // nothing to fetch for a malformed manifest
            }
            Optional<String> body = ipfsGatewayClient.fetch(entity.getIpfsCid());
            entity.setIpfsLastAttempt(LocalDateTime.now());
            if (body.isEmpty()) {
                entity.setIpfsAttempts(entity.getIpfsAttempts() + 1);
                if (entity.getIpfsAttempts() >= failAfterAttempts) {
                    entity.setIpfsCheck(CheckStatus.FAIL);
                }
                entity.recomputeVerdict();
                documentRepository.save(entity);
                return;
            }
            entity.setIpfsCheck(CheckStatus.PASS);
            evaluateEnvelope(entity, body.get());
            entity.recomputeVerdict();
            documentRepository.save(entity);
        } catch (Exception e) {
            log.error("Envelope verification failed for tx {}: {}", entity.getTxHash(),
                    e.getMessage());
        }
    }

    private void evaluateEnvelope(DocumentEntity entity, String body) {
        JsonNode envelope;
        try {
            envelope = objectMapper.readTree(body);
        } catch (Exception e) {
            entity.setEnvelopeCheck(CheckStatus.FAIL);
            entity.setContentHashCheck(CheckStatus.PENDING);
            return;
        }
        byte[] ciphertext = decodeCiphertext(envelope);
        if (ciphertext != null && entity.getContentHash() != null) {
            String computed = sha256Hex(ciphertext);
            entity.setContentHashCheck(entity.getContentHash().equals(computed)
                    ? CheckStatus.PASS : CheckStatus.FAIL);
        } else {
            entity.setContentHashCheck(CheckStatus.PENDING);
        }
        entity.setEnvelopeCheck(isWellFormed(entity, envelope, ciphertext)
                ? CheckStatus.PASS : CheckStatus.FAIL);
    }

    private byte[] decodeCiphertext(JsonNode envelope) {
        JsonNode payload = envelope.get("payload");
        if (payload == null || payload.get("ciphertext") == null
                || !payload.get("ciphertext").isTextual()) {
            return null;
        }
        try {
            return Base64.getDecoder().decode(payload.get("ciphertext").asText());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private boolean isWellFormed(DocumentEntity entity, JsonNode envelope, byte[] ciphertext) {
        if (!envelope.isObject() || ciphertext == null) {
            return false;
        }
        JsonNode version = envelope.get("version");
        if (version == null || !version.canConvertToInt()
                || version.asInt() != SUPPORTED_ENVELOPE_VERSION
                || entity.getEnvelopeVersion() == null
                || version.asInt() != entity.getEnvelopeVersion()) {
            return false;
        }
        if (!ENVELOPE_TYPE.equals(text(envelope, "type"))) {
            return false;
        }
        // Self-consistency with the on-chain manifest.
        if (!equalsIgnoreNull(text(envelope, "org_id"), entity.getOrganisationId())
                || !equalsIgnoreNull(text(envelope, "content_hash"), entity.getContentHash())
                || !equalsIgnoreNull(text(envelope, "plaintext_hash"), entity.getPlaintextHash())) {
            return false;
        }
        JsonNode payload = envelope.get("payload");
        String nonce = payload != null ? text(payload, "nonce") : null;
        if (nonce == null || !HEX_24.matcher(nonce).matches()) {
            return false;
        }
        JsonNode slots = envelope.get("slots");
        if (slots == null || !slots.isArray() || entity.getSlotCount() == null
                || slots.size() != entity.getSlotCount()) {
            return false;
        }
        for (JsonNode slot : slots) {
            String ephemeralPub = text(slot, "ephemeral_pub");
            String wrappedDek = text(slot, "wrapped_dek");
            if (ephemeralPub == null || !HEX_64.matcher(ephemeralPub).matches()
                    || wrappedDek == null || !HEX_96.matcher(wrappedDek).matches()) {
                return false;
            }
        }
        return true;
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && value.isTextual() ? value.asText() : null;
    }

    private static boolean equalsIgnoreNull(String actual, String expected) {
        return expected == null || expected.equals(actual);
    }

    private static String sha256Hex(byte[] bytes) {
        try {
            return HexUtil.encodeHexString(
                    MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
```

`DocumentVerificationScheduler`:

```java
package org.cardanofoundation.reeve.indexer.service.document;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;

/** Retries transient checks: IPFS-unresolved envelopes and publisher checks that missed their signer row. */
@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentVerificationScheduler {

    private final DocumentRepository documentRepository;
    private final DocumentEnvelopeVerifier envelopeVerifier;
    private final DocumentPublisherResolver publisherResolver;

    @Scheduled(fixedDelayString = "${indexer.verification.retry-interval-ms:300000}",
            initialDelayString = "${indexer.verification.retry-interval-ms:300000}")
    public void retryUnresolved() {
        documentRepository
                .findByIpfsCheckAndManifestCheck(CheckStatus.PENDING, CheckStatus.PASS)
                .forEach(envelopeVerifier::verify);
        documentRepository
                .findByIpfsCheckAndManifestCheck(CheckStatus.FAIL, CheckStatus.PASS)
                .forEach(envelopeVerifier::verify);
        documentRepository
                .findByPublisherCheckAndManifestCheck(CheckStatus.PENDING, CheckStatus.PASS)
                .forEach(doc -> publisherResolver.resolve(doc.getTxHash()));
    }
}
```

`DocumentProcessor.process` — after `documentRepository.save(entity)` / before `publisherResolver.resolve(...)`, add the inline first attempt (mirrors the FUNDING precedent of fetching IPFS during processing; the gateway client is timeout-bounded):

```java
envelopeVerifier.verify(entity);
```

with constructor field `private final DocumentEnvelopeVerifier envelopeVerifier;` — update `DocumentProcessorTest` construction to `new DocumentProcessor(documentRepository, publisherResolver, envelopeVerifier)` with `DocumentEnvelopeVerifier envelopeVerifier = mock(DocumentEnvelopeVerifier.class);` and add one assertion to `validManifestIndexesWithManifestPassAndPendingChecks`: `verify(envelopeVerifier).verify(any(DocumentEntity.class));`.

`ReeveIndexingExampleApplication`: add `@EnableScheduling` (import `org.springframework.scheduling.annotation.EnableScheduling`).

`application.yml` — extend the `indexer:` block:

```yaml
indexer:
  publisher:
    addresses: ${PUBLISHER_ADDRESSES:}
  verification:
    retry-interval-ms: ${VERIFICATION_RETRY_INTERVAL_MS:300000}
    ipfs-fail-after-attempts: ${VERIFICATION_IPFS_FAIL_AFTER:3}
```

- [ ] **Step 4: Run tests**

Run: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test --tests 'org.cardanofoundation.reeve.indexer.service.document.*' --tests 'org.cardanofoundation.reeve.indexer.processor.DocumentProcessorTest'`
Expected: PASS.

---

### Task 6: Public read API — list, detail, envelope proxy (§9.6)

**Files:**
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/view/document/DocumentView.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/view/document/DocumentChecksView.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/view/document/DocumentListResponse.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/view/document/DocumentDetailResponse.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/service/DocumentService.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/controller/DocumentController.java`
- Modify: `src/main/java/org/cardanofoundation/reeve/indexer/processor/IpfsGatewayClient.java` (add bounded `fetchBytes`)
- Test: `src/test/java/org/cardanofoundation/reeve/indexer/service/DocumentServiceTest.java`

**Interfaces:**
- Consumes: `DocumentRepository` (Task 2), `IpfsGatewayClient`.
- Produces (wire, snake_case via the global ObjectMapper):
  - `GET /api/v1/documents?orgId=&verdict=&page=0&size=20&sort=slot,desc` → `DocumentListResponse { content: DocumentView[], total, total_pages, page, size }`
  - `GET /api/v1/documents/{documentId}` → `DocumentDetailResponse { document_id, anchors: DocumentView[], duplicate_anchors: boolean }`, 404 `ProblemDetail(title=DOCUMENT_NOT_FOUND)` when no anchor exists
  - `GET /api/v1/documents/{documentId}/envelope?txHash=` → raw envelope JSON bytes, `Cache-Control: public, max-age=31536000, immutable`; 400 `AMBIGUOUS_DOCUMENT_ID` if several anchors and no `txHash`; 502 `ENVELOPE_UNAVAILABLE` when the gateway fails; 404 otherwise.
  - `DocumentView` fields: `tx_hash, document_id, organisation_id, ipfs_cid, content_hash, plaintext_hash, envelope_version, slot_count, slot, block_time, checks{manifest, publisher, ipfs, content_hash, envelope}, verdict, created_at`.
- All three endpoints are public — **a verifier you must log into is not a verifier** (§9.4).

- [ ] **Step 1: Write failing tests**

```java
package org.cardanofoundation.reeve.indexer.service;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;
import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentDetailResponse;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentListResponse;
import org.cardanofoundation.reeve.indexer.processor.IpfsGatewayClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DocumentServiceTest {

    private DocumentRepository documentRepository;
    private IpfsGatewayClient ipfsGatewayClient;
    private DocumentService service;

    @BeforeEach
    void setUp() {
        documentRepository = mock(DocumentRepository.class);
        ipfsGatewayClient = mock(IpfsGatewayClient.class);
        service = new DocumentService(documentRepository, ipfsGatewayClient);
    }

    private DocumentEntity entity(String txHash, String docId) {
        return DocumentEntity.builder().txHash(txHash).documentId(docId)
                .organisationId("f".repeat(64)).ipfsCid("bafyexamplecid1")
                .contentHash("a".repeat(64)).plaintextHash("b".repeat(64))
                .envelopeVersion(1).slotCount(2).slot(10L)
                .manifestCheck(CheckStatus.PASS).publisherCheck(CheckStatus.PASS)
                .ipfsCheck(CheckStatus.PASS).contentHashCheck(CheckStatus.PASS)
                .envelopeCheck(CheckStatus.PASS).verdict(DocumentVerdict.VERIFIED)
                .build();
    }

    @Test
    void listMapsEntitiesToViews() {
        when(documentRepository.findByOrganisationId(eq("f".repeat(64)), any()))
                .thenReturn(new PageImpl<>(List.of(entity("tx1", "doc-1")),
                        PageRequest.of(0, 20), 1));

        DocumentListResponse response = service.list("f".repeat(64), null, 0, 20, "slot,desc");

        assertEquals(1, response.total());
        assertEquals(1, response.content().size());
        assertEquals("tx1", response.content().get(0).txHash());
        assertEquals(DocumentVerdict.VERIFIED, response.content().get(0).verdict());
    }

    @Test
    void detailReturnsAllAnchorsAndFlagsDuplicates() {
        when(documentRepository.findByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(entity("tx1", "doc-1"), entity("tx2", "doc-1")));

        Optional<DocumentDetailResponse> detail = service.detail("doc-1");

        assertTrue(detail.isPresent());
        assertEquals(2, detail.get().anchors().size());
        assertTrue(detail.get().duplicateAnchors());
    }

    @Test
    void detailIsEmptyForUnknownDocument() {
        when(documentRepository.findByDocumentIdOrderBySlotAsc("nope")).thenReturn(List.of());
        assertTrue(service.detail("nope").isEmpty());
    }

    @Test
    void envelopeProxyFetchesByCid() {
        when(documentRepository.findByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(entity("tx1", "doc-1")));
        when(ipfsGatewayClient.fetchBytes(eq("bafyexamplecid1"), anyLong()))
                .thenReturn(Optional.of("{}".getBytes()));

        Optional<byte[]> envelope = service.fetchEnvelope("doc-1", null);

        assertTrue(envelope.isPresent());
    }

    @Test
    void envelopeProxyWithAmbiguousAnchorsRequiresTxHash() {
        when(documentRepository.findByDocumentIdOrderBySlotAsc("doc-1"))
                .thenReturn(List.of(entity("tx1", "doc-1"), entity("tx2", "doc-1")));

        assertThrows(DocumentService.AmbiguousDocumentIdException.class,
                () -> service.fetchEnvelope("doc-1", null));
        // disambiguated by txHash:
        when(ipfsGatewayClient.fetchBytes(eq("bafyexamplecid1"), anyLong()))
                .thenReturn(Optional.of("{}".getBytes()));
        assertTrue(service.fetchEnvelope("doc-1", "tx2").isPresent());
    }

    @Test
    void invalidSortFieldFallsBackToSlot() {
        when(documentRepository.findByOrganisationId(eq("f".repeat(64)), any()))
                .thenReturn(new PageImpl<>(List.of()));
        assertDoesNotThrow(() -> service.list("f".repeat(64), null, 0, 20, "evil_column,desc"));
    }
}
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement views** (records; `checks` uses explicit sub-record; global SNAKE_CASE handles the wire names):

```java
package org.cardanofoundation.reeve.indexer.model.view.document;

import org.cardanofoundation.reeve.indexer.model.domain.document.CheckStatus;

public record DocumentChecksView(CheckStatus manifest, CheckStatus publisher, CheckStatus ipfs,
        CheckStatus contentHash, CheckStatus envelope) {
}
```

```java
package org.cardanofoundation.reeve.indexer.model.view.document;

import java.time.LocalDateTime;

import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;

public record DocumentView(String txHash, String documentId, String organisationId,
        String ipfsCid, String contentHash, String plaintextHash, Integer envelopeVersion,
        Integer slotCount, Long slot, Long blockTime, DocumentChecksView checks,
        DocumentVerdict verdict, LocalDateTime createdAt) {

    public static DocumentView from(DocumentEntity e) {
        return new DocumentView(e.getTxHash(), e.getDocumentId(), e.getOrganisationId(),
                e.getIpfsCid(), e.getContentHash(), e.getPlaintextHash(),
                e.getEnvelopeVersion(), e.getSlotCount(), e.getSlot(), e.getBlockTime(),
                new DocumentChecksView(e.getManifestCheck(), e.getPublisherCheck(),
                        e.getIpfsCheck(), e.getContentHashCheck(), e.getEnvelopeCheck()),
                e.getVerdict(), e.getCreatedAt());
    }
}
```

```java
package org.cardanofoundation.reeve.indexer.model.view.document;

import java.util.List;

public record DocumentListResponse(List<DocumentView> content, long total, int totalPages,
        int page, int size) {
}
```

```java
package org.cardanofoundation.reeve.indexer.model.view.document;

import java.util.List;

public record DocumentDetailResponse(String documentId, List<DocumentView> anchors,
        boolean duplicateAnchors) {
}
```

- [ ] **Step 4: Implement `DocumentService`**

```java
package org.cardanofoundation.reeve.indexer.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.entity.DocumentEntity;
import org.cardanofoundation.reeve.indexer.model.repository.DocumentRepository;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentDetailResponse;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentListResponse;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentView;
import org.cardanofoundation.reeve.indexer.processor.IpfsGatewayClient;

@Service
@RequiredArgsConstructor
public class DocumentService {

    /** Sort fields are whitelisted — everything else silently falls back (no SQL surprises). */
    private static final Set<String> SORTABLE = Set.of("slot", "blockTime", "createdAt");
    private static final long MAX_ENVELOPE_BYTES = 15L * 1024 * 1024;

    private final DocumentRepository documentRepository;
    private final IpfsGatewayClient ipfsGatewayClient;

    public DocumentListResponse list(String orgId, DocumentVerdict verdict, int page, int size,
            String sort) {
        PageRequest pageRequest = PageRequest.of(Math.max(0, page),
                Math.min(Math.max(1, size), 200), parseSort(sort));
        Page<DocumentEntity> result;
        if (orgId != null && verdict != null) {
            result = documentRepository.findByOrganisationIdAndVerdict(orgId, verdict, pageRequest);
        } else if (orgId != null) {
            result = documentRepository.findByOrganisationId(orgId, pageRequest);
        } else if (verdict != null) {
            result = documentRepository.findByVerdict(verdict, pageRequest);
        } else {
            result = documentRepository.findAll(pageRequest);
        }
        return new DocumentListResponse(result.getContent().stream().map(DocumentView::from).toList(),
                result.getTotalElements(), result.getTotalPages(), result.getNumber(),
                result.getSize());
    }

    public Optional<DocumentDetailResponse> detail(String documentId) {
        List<DocumentEntity> anchors = documentRepository.findByDocumentIdOrderBySlotAsc(documentId);
        if (anchors.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(new DocumentDetailResponse(documentId,
                anchors.stream().map(DocumentView::from).toList(), anchors.size() > 1));
    }

    public Optional<byte[]> fetchEnvelope(String documentId, String txHash) {
        List<DocumentEntity> anchors = documentRepository.findByDocumentIdOrderBySlotAsc(documentId);
        if (anchors.isEmpty()) {
            return Optional.empty();
        }
        DocumentEntity anchor;
        if (txHash != null) {
            anchor = anchors.stream().filter(a -> txHash.equals(a.getTxHash())).findFirst()
                    .orElse(null);
            if (anchor == null) {
                return Optional.empty();
            }
        } else if (anchors.size() == 1) {
            anchor = anchors.get(0);
        } else {
            throw new AmbiguousDocumentIdException(documentId);
        }
        if (anchor.getIpfsCid() == null) {
            return Optional.empty();
        }
        return ipfsGatewayClient.fetchBytes(anchor.getIpfsCid(), MAX_ENVELOPE_BYTES);
    }

    private Sort parseSort(String sort) {
        String field = "slot";
        Sort.Direction direction = Sort.Direction.DESC;
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            if (SORTABLE.contains(parts[0].trim())) {
                field = parts[0].trim();
            }
            if (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())) {
                direction = Sort.Direction.ASC;
            }
        }
        return Sort.by(direction, field);
    }

    public static class AmbiguousDocumentIdException extends RuntimeException {
        public AmbiguousDocumentIdException(String documentId) {
            super("Several anchors exist for document " + documentId + " - pass txHash");
        }
    }
}
```

- [ ] **Step 5: Add `fetchBytes` to `IpfsGatewayClient`** (bounded stream read — a hostile CID must not OOM the service):

```java
/** Fetches raw bytes with a hard size cap; empty on failure or when the cap is exceeded. */
public Optional<byte[]> fetchBytes(String cidOrUri, long maxBytes) {
    if (cidOrUri == null || cidOrUri.isBlank()) {
        return Optional.empty();
    }
    String cid = cidOrUri.replace("ipfs://", "");
    try {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ipfsGateway + cid))
                .timeout(Duration.ofSeconds(requestTimeoutSeconds))
                .GET()
                .build();
        HttpResponse<java.io.InputStream> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        if (response.statusCode() != 200) {
            log.error("Failed to fetch IPFS content {}: HTTP {}", cid, response.statusCode());
            return Optional.empty();
        }
        try (java.io.InputStream in = response.body()) {
            byte[] bytes = in.readNBytes((int) Math.min(maxBytes + 1, Integer.MAX_VALUE));
            if (bytes.length > maxBytes) {
                log.error("IPFS content {} exceeds cap of {} bytes", cid, maxBytes);
                return Optional.empty();
            }
            return Optional.of(bytes);
        }
    } catch (Exception e) {
        log.error("Failed to fetch IPFS content {}: {}", cid, e.getMessage());
        return Optional.empty();
    }
}
```

- [ ] **Step 6: Implement `DocumentController`** (springdoc annotations follow `EventController`'s style):

```java
package org.cardanofoundation.reeve.indexer.controller;

import java.util.Optional;

import lombok.RequiredArgsConstructor;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.cardanofoundation.reeve.indexer.model.domain.document.DocumentVerdict;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentDetailResponse;
import org.cardanofoundation.reeve.indexer.model.view.document.DocumentListResponse;
import org.cardanofoundation.reeve.indexer.service.DocumentService;

/**
 * Public read API for indexed Document Vault anchors (contract §9.6). Deliberately
 * unauthenticated: a verifier you must log into is not a verifier. Rows are hash-identified
 * only — file names, descriptions and e-mails never reach L1/IPFS (I10), so they cannot
 * appear here.
 */
@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Published Document Vault anchors and their verification verdicts")
public class DocumentController {

    private final DocumentService documentService;

    @Operation(summary = "Paged index of published documents with verification verdicts")
    @GetMapping
    public ResponseEntity<DocumentListResponse> list(
            @RequestParam(required = false) String orgId,
            @RequestParam(required = false) DocumentVerdict verdict,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "slot,desc") String sort) {
        return ResponseEntity.ok(documentService.list(orgId, verdict, page, size, sort));
    }

    @Operation(summary = "Manifest + verdict detail for every anchor of a documentId")
    @GetMapping("/{documentId}")
    public ResponseEntity<?> detail(@PathVariable String documentId) {
        Optional<DocumentDetailResponse> detail = documentService.detail(documentId);
        if (detail.isEmpty()) {
            return notFound();
        }
        return ResponseEntity.ok(detail.get());
    }

    @Operation(summary = "The IPFS envelope, proxied (spares the browser a CORS fight)")
    @GetMapping(value = "/{documentId}/envelope", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> envelope(@PathVariable String documentId,
            @RequestParam(required = false) String txHash) {
        try {
            Optional<byte[]> envelope = documentService.fetchEnvelope(documentId, txHash);
            if (envelope.isEmpty()) {
                boolean known = documentService.detail(documentId).isPresent();
                if (!known) {
                    return notFound();
                }
                ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_GATEWAY);
                problem.setTitle("ENVELOPE_UNAVAILABLE");
                problem.setDetail("The IPFS gateway did not deliver the envelope");
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(problem);
            }
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(365))
                            .cachePublic().immutable())
                    .body(envelope.get());
        } catch (DocumentService.AmbiguousDocumentIdException e) {
            ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
            problem.setTitle("AMBIGUOUS_DOCUMENT_ID");
            problem.setDetail(e.getMessage());
            return ResponseEntity.badRequest().body(problem);
        }
    }

    private ResponseEntity<ProblemDetail> notFound() {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problem.setTitle("DOCUMENT_NOT_FOUND");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }
}
```

- [ ] **Step 7: Run tests + compile**

Run: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test --tests 'org.cardanofoundation.reeve.indexer.service.DocumentServiceTest' compileJava`
Expected: PASS.

---

### Task 7: Card signing input (§2.8.3), Ed25519 issuer signer, golden vector

**Files:**
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/service/cards/CardSigningInput.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/service/cards/CardIssuerKey.java`
- Create: `docs/vectors/keycard-signing-vector-v1.json` (generated in Step 5)
- Test: `src/test/java/org/cardanofoundation/reeve/indexer/service/cards/CardSigningInputTest.java`
- Test: `src/test/java/org/cardanofoundation/reeve/indexer/service/cards/KeyCardGoldenVectorTest.java`

**Interfaces:**
- Produces:
  - `CardSigningInput.build(String subjectType, String subjectId, String displayName, String email, String organisationId, String publicKey, String label, String assurance, String createdAt, String issuerId, String issuerPublicKey): byte[]` — the exact §2.8.3 byte layout. **This is the hard coupling with the Reeve backend; the golden vector file is the shared artifact.**
  - `CardIssuerKey` — holds the Ed25519 seed; `sign(byte[] input): String` (128-hex signature), `publicKeyHex(): String`, `issuerId(): String`; constructed from config (`indexer.issuer.id`, `indexer.issuer.signing-key`), `Optional`-style factory so a deployment without a key runs with issuance disabled.
- Uses BouncyCastle `org.bouncycastle.crypto.signers.Ed25519Signer` + `Ed25519PrivateKeyParameters` (bcprov-jdk18on 1.79, on the runtime classpath transitively — if `compileOnly` resolution fails, add `implementation("org.bouncycastle:bcprov-jdk18on:1.79")` to `build.gradle.kts` explicitly).

§2.8.3, copied exactly — Ed25519 over a **length-prefixed concatenation**; `enc(s)` = 4-byte big-endian length of UTF-8 bytes, then the bytes; absent optionals encode as `enc("")`; exactly these 14 fields in exactly this order:

```
"REEVE_KEY_CARD" , "1" ,
subject.subjectType , subject.subjectId , subject.displayName , subject.email , subject.organisationId ,
key.publicKey , key.label , key.assurance , key.createdAt ,
issuer.issuerId , issuer.algorithm , issuer.publicKey
```

- [ ] **Step 1: Write failing structural tests**

```java
package org.cardanofoundation.reeve.indexer.service.cards;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CardSigningInputTest {

    private static byte[] enc(String s) {
        byte[] bytes = (s == null ? "" : s).getBytes(StandardCharsets.UTF_8);
        return ByteBuffer.allocate(4 + bytes.length).putInt(bytes.length).put(bytes).array();
    }

    @Test
    void buildsTheFourteenFieldLengthPrefixedInput() {
        byte[] input = CardSigningInput.build("REEVE_ACCOUNT", "sub-1", "Bob Miller",
                "bob@example.org", "org-1", "aa".repeat(32), "Bob's audit key", "PORTABLE",
                "2026-07-14T10:15:30Z", "reeve-indexer-test", "bb".repeat(32));

        ByteBuffer expected = ByteBuffer.allocate(4096);
        for (String field : new String[] {"REEVE_KEY_CARD", "1", "REEVE_ACCOUNT", "sub-1",
                "Bob Miller", "bob@example.org", "org-1", "aa".repeat(32), "Bob's audit key",
                "PORTABLE", "2026-07-14T10:15:30Z", "reeve-indexer-test", "Ed25519",
                "bb".repeat(32)}) {
            expected.put(enc(field));
        }
        byte[] expectedBytes = new byte[expected.position()];
        expected.rewind();
        expected.get(expectedBytes);

        assertArrayEquals(expectedBytes, input);
    }

    @Test
    void absentOptionalFieldsEncodeAsFourZeroBytes() {
        byte[] withEmpty = CardSigningInput.build("EXTERNAL", "uuid-1", null, null, "org-1",
                "aa".repeat(32), null, "PORTABLE", "2026-07-14T10:15:30Z", "issuer", "bb".repeat(32));
        byte[] withEmptyString = CardSigningInput.build("EXTERNAL", "uuid-1", "", "", "org-1",
                "aa".repeat(32), "", "PORTABLE", "2026-07-14T10:15:30Z", "issuer", "bb".repeat(32));
        assertArrayEquals(withEmpty, withEmptyString);
    }

    @Test
    void multiByteUtf8LengthIsByteLengthNotCharLength() {
        byte[] input = CardSigningInput.build("EXTERNAL", "id", "Bjørn Müller é世",
                null, "org", "aa".repeat(32), null, "PORTABLE", "t", "i", "bb".repeat(32));
        // "REEVE_KEY_CARD"(4+14) + "1"(4+1) + "EXTERNAL"(4+8) + "id"(4+2) precede displayName;
        int offset = 18 + 5 + 12 + 6;
        int declared = ByteBuffer.wrap(input, offset, 4).getInt();
        assertEquals("Bjørn Müller é世".getBytes(StandardCharsets.UTF_8).length, declared);
    }

    @Test
    void signatureIsDeterministicAndVerifiable() {
        CardIssuerKey key = CardIssuerKey.fromSeed("reeve-indexer-test",
                "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60");
        byte[] input = CardSigningInput.build("EXTERNAL", "id", null, null, "org",
                "aa".repeat(32), null, "PORTABLE", "t", key.issuerId(), key.publicKeyHex());
        String sig1 = key.sign(input);
        String sig2 = key.sign(input);
        assertEquals(sig1, sig2);          // Ed25519 is deterministic
        assertEquals(128, sig1.length());  // 64 bytes hex
        // RFC 8032 test-vector seed -> known public key:
        assertEquals("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a",
                key.publicKeyHex());
    }
}
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement**

```java
package org.cardanofoundation.reeve.indexer.service.cards;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

/**
 * The §2.8.3 card signing input: Ed25519 is computed over a length-prefixed concatenation,
 * NOT over JSON text — this removes every canonicalisation question. enc(s) = 4-byte
 * big-endian length of the UTF-8 bytes of s, followed by those bytes; null/absent == "".
 * Exactly 14 fields, exactly this order. Any change to this list is a new card version (I7).
 * BYTE-IDENTICAL with the Reeve backend's verifier — the shared KAT lives at
 * docs/vectors/keycard-signing-vector-v1.json.
 */
public final class CardSigningInput {

    public static final String CARD_TYPE = "REEVE_KEY_CARD";
    public static final String CARD_VERSION = "1";
    public static final String ALGORITHM = "Ed25519";

    private CardSigningInput() {
    }

    public static byte[] build(String subjectType, String subjectId, String displayName,
            String email, String organisationId, String publicKey, String label,
            String assurance, String createdAt, String issuerId, String issuerPublicKey) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        enc(out, CARD_TYPE);
        enc(out, CARD_VERSION);
        enc(out, subjectType);
        enc(out, subjectId);
        enc(out, displayName);
        enc(out, email);
        enc(out, organisationId);
        enc(out, publicKey);
        enc(out, label);
        enc(out, assurance);
        enc(out, createdAt);
        enc(out, issuerId);
        enc(out, ALGORITHM);
        enc(out, issuerPublicKey);
        return out.toByteArray();
    }

    private static void enc(ByteArrayOutputStream out, String value) {
        byte[] bytes = (value == null ? "" : value).getBytes(StandardCharsets.UTF_8);
        out.write((bytes.length >>> 24) & 0xFF);
        out.write((bytes.length >>> 16) & 0xFF);
        out.write((bytes.length >>> 8) & 0xFF);
        out.write(bytes.length & 0xFF);
        out.writeBytes(bytes);
    }
}
```

```java
package org.cardanofoundation.reeve.indexer.service.cards;

import lombok.Getter;

import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;

import com.bloxbean.cardano.client.util.HexUtil;

/**
 * The issuer's Ed25519 signing key — the single most sensitive secret in the system (§9.5).
 * Server-side only: it never reaches a browser, a log line, or a response body. The seed is
 * held privately; only the public key and issuerId are exposed.
 */
public final class CardIssuerKey {

    @Getter
    private final String issuerId;
    private final Ed25519PrivateKeyParameters privateKey;
    @Getter
    private final String publicKeyHex;

    private CardIssuerKey(String issuerId, Ed25519PrivateKeyParameters privateKey) {
        this.issuerId = issuerId;
        this.privateKey = privateKey;
        this.publicKeyHex = HexUtil.encodeHexString(privateKey.generatePublicKey().getEncoded());
    }

    /** @throws IllegalArgumentException on malformed seed — a deployment that believes it can
     *  issue cards but cannot must fail at startup, not at first request. */
    public static CardIssuerKey fromSeed(String issuerId, String seedHex) {
        if (issuerId == null || issuerId.isBlank()) {
            throw new IllegalArgumentException("indexer.issuer.id must not be blank");
        }
        byte[] seed = HexUtil.decodeHexString(seedHex);
        if (seed.length != 32) {
            throw new IllegalArgumentException(
                    "indexer.issuer.signing-key must be a 64-hex Ed25519 seed");
        }
        return new CardIssuerKey(issuerId, new Ed25519PrivateKeyParameters(seed, 0));
    }

    public String sign(byte[] input) {
        Ed25519Signer signer = new Ed25519Signer();
        signer.init(true, privateKey);
        signer.update(input, 0, input.length);
        return HexUtil.encodeHexString(signer.generateSignature());
    }

    // Accessor names without the Lombok get-prefix, to read naturally at call sites.
    public String issuerId() {
        return issuerId;
    }

    public String publicKeyHex() {
        return publicKeyHex;
    }
}
```

(If Lombok `@Getter` + manual accessors clash, drop the Lombok annotations and keep only the manual `issuerId()` / `publicKeyHex()` accessors.)

- [ ] **Step 4: Run structural tests** — expected PASS, including the RFC 8032 public-key pin.

- [ ] **Step 5: Generate and pin the golden vector.** Write this generator test, run it once, copy its output into `docs/vectors/keycard-signing-vector-v1.json`, then delete the `@Disabled` generator or keep it disabled:

```java
// Temporary generator (delete after pinning, or keep @Disabled):
@org.junit.jupiter.api.Disabled("generator - run manually to (re)pin the golden vector")
@Test
void printGoldenVector() {
    CardIssuerKey key = CardIssuerKey.fromSeed("reeve-indexer-test",
            "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60");
    byte[] input = CardSigningInput.build("REEVE_ACCOUNT",
            "8d9e0000-1111-2222-3333-444455556666", "Bob Miller", "bob@example.org",
            "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94",
            "8f40c5adb68f25624ae5b214ea767a6ec94d829d3d7b5e1ad1ba6f3e2138285f",
            "Bob's audit key", "PORTABLE", "2026-07-14T10:15:30Z",
            key.issuerId(), key.publicKeyHex());
    System.out.println("signingInputHex=" + com.bloxbean.cardano.client.util.HexUtil.encodeHexString(input));
    System.out.println("signatureHex=" + key.sign(input));
}
```

`docs/vectors/keycard-signing-vector-v1.json` (fill the two `<PIN>` values from the generator output — every other value is fixed):

```json
{
  "description": "Golden KAT for the REEVE_KEY_CARD v1 signing input (contract §2.8.3). Shared artifact: the Reeve backend's import verifier and this Indexer's issuer MUST both reproduce these bytes exactly. The issuer seed below is the RFC 8032 TEST vector seed - never a production key.",
  "signingInputRecipe": "enc(field) = 4-byte big-endian UTF-8 byte length || bytes; fields in order: type, version, subject.subjectType, subject.subjectId, subject.displayName, subject.email, subject.organisationId, key.publicKey, key.label, key.assurance, key.createdAt, issuer.issuerId, issuer.algorithm, issuer.publicKey; absent optional == empty string",
  "card": {
    "v": 1,
    "type": "REEVE_KEY_CARD",
    "subject": {
      "subjectType": "REEVE_ACCOUNT",
      "subjectId": "8d9e0000-1111-2222-3333-444455556666",
      "displayName": "Bob Miller",
      "email": "bob@example.org",
      "organisationId": "75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94"
    },
    "key": {
      "publicKey": "8f40c5adb68f25624ae5b214ea767a6ec94d829d3d7b5e1ad1ba6f3e2138285f",
      "label": "Bob's audit key",
      "assurance": "PORTABLE",
      "createdAt": "2026-07-14T10:15:30Z"
    },
    "issuer": {
      "issuerId": "reeve-indexer-test",
      "algorithm": "Ed25519",
      "publicKey": "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"
    }
  },
  "testOnlyIssuerSeedHex": "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60",
  "expectedSigningInputHex": "<PIN>",
  "expectedSignatureHex": "<PIN>"
}
```

- [ ] **Step 6: Write the KAT that consumes the pinned vector**

```java
package org.cardanofoundation.reeve.indexer.service.cards;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;

import com.bloxbean.cardano.client.util.HexUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Golden KAT for the §2.8.3 signing input. THE cross-team coupling test: the Reeve backend's
 * card verifier asserts against the same docs/vectors/keycard-signing-vector-v1.json. If this
 * test fails after a change, the change is wrong — the vector is frozen with the contract.
 */
class KeyCardGoldenVectorTest {

    @Test
    void signingInputAndSignatureMatchTheGoldenVector() throws Exception {
        JsonNode vector = new ObjectMapper()
                .readTree(Files.readString(Path.of("docs/vectors/keycard-signing-vector-v1.json")));
        JsonNode subject = vector.at("/card/subject");
        JsonNode key = vector.at("/card/key");
        JsonNode issuer = vector.at("/card/issuer");

        byte[] input = CardSigningInput.build(
                subject.get("subjectType").asText(), subject.get("subjectId").asText(),
                subject.get("displayName").asText(), subject.get("email").asText(),
                subject.get("organisationId").asText(),
                key.get("publicKey").asText(), key.get("label").asText(),
                key.get("assurance").asText(), key.get("createdAt").asText(),
                issuer.get("issuerId").asText(), issuer.get("publicKey").asText());

        assertEquals(vector.get("expectedSigningInputHex").asText(),
                HexUtil.encodeHexString(input));

        CardIssuerKey issuerKey = CardIssuerKey.fromSeed(issuer.get("issuerId").asText(),
                vector.get("testOnlyIssuerSeedHex").asText());
        assertEquals(issuer.get("publicKey").asText(), issuerKey.publicKeyHex());
        assertEquals(vector.get("expectedSignatureHex").asText(), issuerKey.sign(input));
    }
}
```

Note: Gradle's test working directory is the project root, so `docs/vectors/...` resolves. If it does not (check with a failing path assertion), resolve via `Path.of(System.getProperty("user.dir")).resolve("docs/vectors/...")` or set `tasks.test { workingDir = rootDir }`.

- [ ] **Step 7: Run all card tests**

Run: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test --tests 'org.cardanofoundation.reeve.indexer.service.cards.*'`
Expected: PASS.

---

### Task 8: Card issuance API + Spring Security

**Files:**
- Modify: `build.gradle.kts` (add `implementation("org.springframework.boot:spring-boot-starter-security")`)
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/config/SecurityConfig.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/config/CardIssuerConfig.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/model/view/cards/CardViews.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/service/cards/CardIssuanceService.java`
- Create: `src/main/java/org/cardanofoundation/reeve/indexer/controller/CardController.java`
- Modify: `src/main/resources/application.yml` (issuer + issuance keys)
- Test: `src/test/java/org/cardanofoundation/reeve/indexer/service/cards/CardIssuanceServiceTest.java`

**Interfaces:**
- Consumes: `CardSigningInput`, `CardIssuerKey` (Task 7), `IssuedCardRepository` (Task 2), `Clock` bean (existing `ClockConfig`).
- Produces (wire): `POST /api/v1/cards/issue` (authenticated) body `{ "subject": { "subjectType", "subjectId", "displayName", "email", "organisationId" }, "key": { "publicKey", "label" } }` → **camelCase** card JSON per §2.8.2 (explicit `@JsonProperty` on every field — the global SNAKE_CASE mapper must not touch this shape); `GET /api/v1/cards?orgId=&subjectId=&page=&size=` (authenticated) → paged registry of public parts; `GET /api/v1/cards/status` (public) → `{"issuance_enabled": bool}` so the frontend can hide the view when unconfigured.
- Security: everything `permitAll` **except** `/api/v1/cards/**`; `/api/v1/cards/status` explicitly public; HTTP Basic, stateless, CSRF disabled; operator principal from `indexer.issuance.username/password`. No creds or no issuer key configured ⇒ issuance endpoints return `503 CARD_ISSUANCE_UNAVAILABLE`.

Behavioural rules (all from §2.8/§9.4):
- Server forces `assurance = "PORTABLE"` and sets `createdAt` (UTC ISO-8601 instant from the `Clock` bean) — the client cannot claim a PASSKEY tier for an Indexer-issued key (§2.8.4).
- `subjectType` must be `REEVE_ACCOUNT` (then `subjectId` required — the holder's Keycloak `sub`) or `EXTERNAL` (then `subjectId` is server-minted `UUID.randomUUID()`); anything else → `400 INVALID_SUBJECT`.
- `key.publicKey` must match `^[0-9a-f]{64}$` → else `400 INVALID_PUBLIC_KEY`.
- The raw request JSON is scanned recursively for the field names `privateKey`, `wrappedPriv`, `wrapped` → `400 CARD_CONTAINS_PRIVATE_KEY` (I5 defense in depth; the DTO has no such field to begin with). Honest limit (documented in the view copy, not solvable server-side): a 32-byte hex private key pasted into the publicKey box is indistinguishable from a public key.
- Idempotent re-issue: same `(subjectId, organisationId, publicKey)` returns the existing registry entry re-signed fields as stored (label/email refresh allowed on the stored row, mirroring §5.13's idempotency).
- Registry stores and returns **public parts only**.

- [ ] **Step 1: Write failing service tests**

```java
package org.cardanofoundation.reeve.indexer.service.cards;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;
import org.cardanofoundation.reeve.indexer.model.repository.IssuedCardRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CardIssuanceServiceTest {

    private static final String SEED =
            "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private IssuedCardRepository repository;
    private CardIssuanceService service;

    @BeforeEach
    void setUp() {
        repository = mock(IssuedCardRepository.class);
        when(repository.findBySubjectIdAndOrganisationIdAndPublicKey(any(), any(), any()))
                .thenReturn(Optional.empty());
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        service = new CardIssuanceService(repository,
                Optional.of(CardIssuerKey.fromSeed("reeve-indexer-test", SEED)),
                Clock.fixed(Instant.parse("2026-07-14T10:15:30Z"), ZoneOffset.UTC),
                objectMapper);
    }

    private JsonNode request(String subjectType, String subjectId) throws Exception {
        return objectMapper.readTree("""
            {"subject":{"subjectType":"%s"%s,"displayName":"Bob","email":"bob@example.org",
             "organisationId":"75f95560"},
             "key":{"publicKey":"%s","label":"Bob's key"}}
            """.formatted(subjectType,
                subjectId == null ? "" : ",\"subjectId\":\"" + subjectId + "\"",
                "8f".repeat(32)));
    }

    @Test
    void issuesSignedCamelCaseCard() throws Exception {
        JsonNode card = service.issue(request("REEVE_ACCOUNT", "kc-sub-1"));

        assertEquals(1, card.get("v").asInt());
        assertEquals("REEVE_KEY_CARD", card.get("type").asText());
        assertEquals("REEVE_ACCOUNT", card.at("/subject/subjectType").asText());
        assertEquals("kc-sub-1", card.at("/subject/subjectId").asText());
        assertEquals("PORTABLE", card.at("/key/assurance").asText()); // server-forced
        assertEquals("2026-07-14T10:15:30Z", card.at("/key/createdAt").asText());
        assertEquals("Ed25519", card.at("/issuer/algorithm").asText());
        assertEquals(128, card.get("signature").asText().length());
        assertFalse(card.has("privateKey")); // the server never assembles one
        verify(repository).save(any(IssuedCardEntity.class));
    }

    @Test
    void externalSubjectGetsMintedUuid() throws Exception {
        JsonNode card = service.issue(request("EXTERNAL", null));
        assertDoesNotThrow(() ->
                java.util.UUID.fromString(card.at("/subject/subjectId").asText()));
    }

    @Test
    void reeveAccountWithoutSubjectIdIsRejected() {
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(request("REEVE_ACCOUNT", null)));
        assertEquals("INVALID_SUBJECT", e.getTitle());
    }

    @Test
    void unknownSubjectTypeIsRejected() {
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(request("SOMETHING", "x")));
        assertEquals("INVALID_SUBJECT", e.getTitle());
    }

    @Test
    void malformedPublicKeyIsRejected() throws Exception {
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","displayName":"B","organisationId":"o"},
             "key":{"publicKey":"NOT-HEX","label":"l"}}
            """);
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("INVALID_PUBLIC_KEY", e.getTitle());
    }

    @Test
    void smuggledPrivateKeyMaterialIsRejected() throws Exception {
        JsonNode bad = objectMapper.readTree("""
            {"subject":{"subjectType":"EXTERNAL","organisationId":"o"},
             "key":{"publicKey":"%s","label":"l",
                    "privateKey":{"wrapped":"deadbeef"}}}
            """.formatted("8f".repeat(32)));
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> service.issue(bad));
        assertEquals("CARD_CONTAINS_PRIVATE_KEY", e.getTitle());
    }

    @Test
    void withoutIssuerKeyIssuanceIsUnavailable() throws Exception {
        CardIssuanceService disabled = new CardIssuanceService(repository, Optional.empty(),
                Clock.systemUTC(), objectMapper);
        CardIssuanceService.CardIssuanceException e =
                assertThrows(CardIssuanceService.CardIssuanceException.class,
                        () -> disabled.issue(request("EXTERNAL", null)));
        assertEquals("CARD_ISSUANCE_UNAVAILABLE", e.getTitle());
        assertFalse(disabled.isEnabled());
    }

    @Test
    void reissuingSameKeyIsIdempotent() throws Exception {
        IssuedCardEntity existing = IssuedCardEntity.builder()
                .cardId(java.util.UUID.randomUUID()).subjectType("REEVE_ACCOUNT")
                .subjectId("kc-sub-1").organisationId("75f95560")
                .publicKey("8f".repeat(32)).label("old label").assurance("PORTABLE")
                .createdAtSigned("2026-01-01T00:00:00Z").issuerId("reeve-indexer-test")
                .signature("ab".repeat(64)).build();
        when(repository.findBySubjectIdAndOrganisationIdAndPublicKey("kc-sub-1", "75f95560",
                "8f".repeat(32))).thenReturn(Optional.of(existing));

        JsonNode card = service.issue(request("REEVE_ACCOUNT", "kc-sub-1"));

        // The stored signature and signed createdAt are returned - NOT re-signed:
        assertEquals("ab".repeat(64), card.get("signature").asText());
        assertEquals("2026-01-01T00:00:00Z", card.at("/key/createdAt").asText());
    }

    @Test
    void issuedCardRoundTripsThroughSigningInputVerification() throws Exception {
        // End-to-end: the card the service emits verifies against CardSigningInput + issuer key.
        JsonNode card = service.issue(request("EXTERNAL", null));
        byte[] input = CardSigningInput.build(
                card.at("/subject/subjectType").asText(), card.at("/subject/subjectId").asText(),
                card.at("/subject/displayName").asText(), card.at("/subject/email").asText(),
                card.at("/subject/organisationId").asText(),
                card.at("/key/publicKey").asText(), card.at("/key/label").asText(),
                card.at("/key/assurance").asText(), card.at("/key/createdAt").asText(),
                card.at("/issuer/issuerId").asText(), card.at("/issuer/publicKey").asText());
        CardIssuerKey key = CardIssuerKey.fromSeed("reeve-indexer-test", SEED);
        assertEquals(key.sign(input), card.get("signature").asText());
    }
}
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement `CardIssuanceService`**

```java
package org.cardanofoundation.reeve.indexer.service.cards;

import java.time.Clock;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Iterator;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;
import org.cardanofoundation.reeve.indexer.model.repository.IssuedCardRepository;

/**
 * Issues signed key cards (§9.4/§2.8). The backend signs the PUBLIC part only; the private
 * key is generated in the operator's browser and never reaches this service (I1/I5) — the
 * request schema has no private-key field and smuggled key material is rejected outright.
 * The card JSON is camelCase per §2.8.2, built as an ObjectNode so the global SNAKE_CASE
 * mapper cannot rename fields.
 */
@Service
@RequiredArgsConstructor
public class CardIssuanceService {

    private static final Pattern PUBLIC_KEY_SHAPE = Pattern.compile("^[0-9a-f]{64}$");
    private static final Set<String> FORBIDDEN_FIELDS =
            Set.of("privateKey", "wrappedPriv", "wrapped");

    private final IssuedCardRepository repository;
    private final Optional<CardIssuerKey> issuerKey;
    private final Clock clock;
    private final ObjectMapper objectMapper;

    public boolean isEnabled() {
        return issuerKey.isPresent();
    }

    public JsonNode issue(JsonNode request) {
        CardIssuerKey key = issuerKey.orElseThrow(() -> new CardIssuanceException(503,
                "CARD_ISSUANCE_UNAVAILABLE", "No issuer signing key is configured"));
        rejectPrivateKeyMaterial(request);

        JsonNode subject = request.get("subject");
        JsonNode keyNode = request.get("key");
        if (subject == null || keyNode == null) {
            throw new CardIssuanceException(400, "INVALID_SUBJECT",
                    "Request must carry subject and key sections");
        }
        String subjectType = text(subject, "subjectType");
        String subjectId = text(subject, "subjectId");
        if ("REEVE_ACCOUNT".equals(subjectType)) {
            if (subjectId == null || subjectId.isBlank()) {
                throw new CardIssuanceException(400, "INVALID_SUBJECT",
                        "REEVE_ACCOUNT requires the holder's Keycloak sub as subjectId");
            }
        } else if ("EXTERNAL".equals(subjectType)) {
            subjectId = UUID.randomUUID().toString();
        } else {
            throw new CardIssuanceException(400, "INVALID_SUBJECT",
                    "subjectType must be REEVE_ACCOUNT or EXTERNAL");
        }
        String organisationId = text(subject, "organisationId");
        if (organisationId == null || organisationId.isBlank()) {
            throw new CardIssuanceException(400, "INVALID_SUBJECT",
                    "subject.organisationId is required");
        }
        String publicKey = text(keyNode, "publicKey");
        if (publicKey == null || !PUBLIC_KEY_SHAPE.matcher(publicKey).matches()) {
            throw new CardIssuanceException(400, "INVALID_PUBLIC_KEY",
                    "key.publicKey must be 64 lowercase hex characters");
        }
        String displayName = text(subject, "displayName");
        String email = text(subject, "email");
        String label = text(keyNode, "label");

        // Idempotent re-issue: the stored signature stays valid because §2.8.3 signs exactly
        // the stored fields.
        Optional<IssuedCardEntity> existing = repository
                .findBySubjectIdAndOrganisationIdAndPublicKey(subjectId, organisationId, publicKey);
        if (existing.isPresent()) {
            return toCardJson(existing.get(), key);
        }

        String createdAt = DateTimeFormatter.ISO_INSTANT
                .format(clock.instant().truncatedTo(ChronoUnit.SECONDS));
        byte[] input = CardSigningInput.build(subjectType, subjectId, displayName, email,
                organisationId, publicKey, label, "PORTABLE", createdAt,
                key.issuerId(), key.publicKeyHex());
        String signature = key.sign(input);

        IssuedCardEntity entity = IssuedCardEntity.builder()
                .cardId(UUID.randomUUID())
                .subjectType(subjectType).subjectId(subjectId)
                .displayName(displayName).email(email)
                .organisationId(organisationId)
                .publicKey(publicKey).label(label)
                .assurance("PORTABLE")
                .createdAtSigned(createdAt)
                .issuerId(key.issuerId())
                .signature(signature)
                .build();
        repository.save(entity);
        return toCardJson(entity, key);
    }

    public Page<IssuedCardEntity> registry(String orgId, String subjectId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(Math.max(0, page),
                Math.min(Math.max(1, size), 200), Sort.by(Sort.Direction.DESC, "createdAt"));
        if (orgId != null && !orgId.isBlank()) {
            return repository.findByOrganisationId(orgId, pageRequest);
        }
        if (subjectId != null && !subjectId.isBlank()) {
            return repository.findBySubjectId(subjectId, pageRequest);
        }
        return repository.findAll(pageRequest);
    }

    /** Re-assembles the §2.8.2 card JSON (public parts) from a registry row. */
    public JsonNode toCardJson(IssuedCardEntity e, CardIssuerKey key) {
        ObjectNode card = objectMapper.createObjectNode();
        card.put("v", 1);
        card.put("type", CardSigningInput.CARD_TYPE);
        ObjectNode subject = card.putObject("subject");
        subject.put("subjectType", e.getSubjectType());
        subject.put("subjectId", e.getSubjectId());
        putIfPresent(subject, "displayName", e.getDisplayName());
        putIfPresent(subject, "email", e.getEmail());
        subject.put("organisationId", e.getOrganisationId());
        ObjectNode keyNode = card.putObject("key");
        keyNode.put("publicKey", e.getPublicKey());
        putIfPresent(keyNode, "label", e.getLabel());
        keyNode.put("assurance", e.getAssurance());
        keyNode.put("createdAt", e.getCreatedAtSigned());
        ObjectNode issuer = card.putObject("issuer");
        issuer.put("issuerId", e.getIssuerId());
        issuer.put("algorithm", CardSigningInput.ALGORITHM);
        issuer.put("publicKey", key.publicKeyHex());
        card.put("signature", e.getSignature());
        return card;
    }

    public Optional<JsonNode> exportCard(UUID cardId) {
        return issuerKey.flatMap(key -> repository.findById(cardId)
                .map(entity -> toCardJson(entity, key)));
    }

    private void rejectPrivateKeyMaterial(JsonNode node) {
        if (node == null) {
            return;
        }
        if (node.isObject()) {
            for (Iterator<String> it = node.fieldNames(); it.hasNext(); ) {
                String field = it.next();
                if (FORBIDDEN_FIELDS.contains(field)) {
                    throw new CardIssuanceException(400, "CARD_CONTAINS_PRIVATE_KEY",
                            "The issuance request must never carry private key material (I5)");
                }
                rejectPrivateKeyMaterial(node.get(field));
            }
        } else if (node.isArray()) {
            node.forEach(this::rejectPrivateKeyMaterial);
        }
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && value.isTextual() && !value.asText().isBlank()
                ? value.asText() : null;
    }

    private static void putIfPresent(ObjectNode node, String field, String value) {
        if (value != null && !value.isBlank()) {
            node.put(field, value);
        }
    }

    @Getter
    public static class CardIssuanceException extends RuntimeException {
        private final int status;
        private final String title;

        public CardIssuanceException(int status, String title, String detail) {
            super(detail);
            this.status = status;
            this.title = title;
        }
    }
}
```

- [ ] **Step 4: Implement config + security + controller**

`CardIssuerConfig`:

```java
package org.cardanofoundation.reeve.indexer.config;

import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.cardanofoundation.reeve.indexer.service.cards.CardIssuerKey;

@Configuration
@Slf4j
public class CardIssuerConfig {

    /**
     * Absent key ⇒ issuance disabled (503), everything else runs. Malformed key ⇒ fail
     * startup: a deployment that believes it can issue cards but cannot is worse than one
     * that refuses to boot (§9.5).
     */
    @Bean
    public Optional<CardIssuerKey> cardIssuerKey(
            @Value("${indexer.issuer.id:}") String issuerId,
            @Value("${indexer.issuer.signing-key:}") String seedHex) {
        if (seedHex == null || seedHex.isBlank()) {
            log.warn("indexer.issuer.signing-key not configured - card issuance is DISABLED");
            return Optional.empty();
        }
        return Optional.of(CardIssuerKey.fromSeed(issuerId, seedHex));
    }
}
```

`SecurityConfig`:

```java
package org.cardanofoundation.reeve.indexer.config;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Verification is public — a verifier you must log into is not a verifier (§9.4). Only card
 * issuance is authenticated: it is a trust root. Single operator principal from env config;
 * HTTP Basic over TLS, stateless, no cookies (CSRF not applicable).
 */
@Configuration
@EnableWebSecurity
@Slf4j
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/cards/status").permitAll()
                        .requestMatchers("/api/v1/cards/**").authenticated()
                        .anyRequest().permitAll())
                .httpBasic(Customizer.withDefaults());
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(
            @Value("${indexer.issuance.username:}") String username,
            @Value("${indexer.issuance.password:}") String password) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            log.warn("indexer.issuance credentials not configured - card endpoints will "
                    + "reject every login");
            return new InMemoryUserDetailsManager();
        }
        return new InMemoryUserDetailsManager(User.withUsername(username)
                .password("{noop}" + password).roles("ISSUER").build());
    }
}
```

`CardController`:

```java
package org.cardanofoundation.reeve.indexer.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.JsonNode;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;
import org.cardanofoundation.reeve.indexer.model.view.cards.CardViews;
import org.cardanofoundation.reeve.indexer.service.cards.CardIssuanceService;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
@Tag(name = "Key cards", description = "Issue and re-export REEVE_KEY_CARDs (§9.4). Authenticated - issuance is a trust root.")
public class CardController {

    private final CardIssuanceService cardIssuanceService;

    @Operation(summary = "Whether this deployment can issue cards (public probe)")
    @GetMapping("/status")
    public ResponseEntity<CardViews.StatusView> status() {
        return ResponseEntity.ok(new CardViews.StatusView(cardIssuanceService.isEnabled()));
    }

    @Operation(summary = "Sign a card's PUBLIC part (the private key never reaches this API)")
    @PostMapping("/issue")
    public ResponseEntity<?> issue(@RequestBody JsonNode request) {
        try {
            return ResponseEntity.ok(cardIssuanceService.issue(request));
        } catch (CardIssuanceService.CardIssuanceException e) {
            return problem(e);
        }
    }

    @Operation(summary = "Registry of issued cards - public parts only")
    @GetMapping
    public ResponseEntity<CardViews.RegistryResponse> registry(
            @RequestParam(required = false) String orgId,
            @RequestParam(required = false) String subjectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<IssuedCardEntity> result = cardIssuanceService.registry(orgId, subjectId, page, size);
        List<CardViews.RegistryEntryView> content = result.getContent().stream()
                .map(CardViews.RegistryEntryView::from).toList();
        return ResponseEntity.ok(new CardViews.RegistryResponse(content,
                result.getTotalElements(), result.getTotalPages(), result.getNumber(),
                result.getSize()));
    }

    @Operation(summary = "Re-export a registry entry as a contact card")
    @GetMapping("/{cardId}/export")
    public ResponseEntity<?> export(@PathVariable UUID cardId) {
        Optional<JsonNode> card = cardIssuanceService.exportCard(cardId);
        if (card.isEmpty()) {
            ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
            problem.setTitle("CARD_NOT_FOUND");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
        }
        return ResponseEntity.ok(card.get());
    }

    private ResponseEntity<ProblemDetail> problem(CardIssuanceService.CardIssuanceException e) {
        ProblemDetail problem = ProblemDetail.forStatus(e.getStatus());
        problem.setTitle(e.getTitle());
        problem.setDetail(e.getMessage());
        return ResponseEntity.status(e.getStatus()).body(problem);
    }
}
```

`CardViews`:

```java
package org.cardanofoundation.reeve.indexer.model.view.cards;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;

public final class CardViews {

    private CardViews() {
    }

    public record StatusView(boolean issuanceEnabled) {
    }

    /** Registry row - PUBLIC parts only, snake_case on the wire like the rest of the read API. */
    public record RegistryEntryView(UUID cardId, String subjectType, String subjectId,
            String displayName, String email, String organisationId, String publicKey,
            String label, String assurance, String createdAtSigned, String issuerId,
            LocalDateTime createdAt) {

        public static RegistryEntryView from(IssuedCardEntity e) {
            return new RegistryEntryView(e.getCardId(), e.getSubjectType(), e.getSubjectId(),
                    e.getDisplayName(), e.getEmail(), e.getOrganisationId(), e.getPublicKey(),
                    e.getLabel(), e.getAssurance(), e.getCreatedAtSigned(), e.getIssuerId(),
                    e.getCreatedAt());
        }
    }

    public record RegistryResponse(List<RegistryEntryView> content, long total, int totalPages,
            int page, int size) {
    }
}
```

`application.yml` — extend the `indexer:` block:

```yaml
indexer:
  issuer:
    id: ${ISSUER_ID:}
    signing-key: ${ISSUER_SIGNING_KEY:}
  issuance:
    username: ${ISSUANCE_USERNAME:}
    password: ${ISSUANCE_PASSWORD:}
```

`build.gradle.kts` — add to `dependencies`:

```kotlin
implementation("org.springframework.boot:spring-boot-starter-security")
```

- [ ] **Step 5: Run tests + full build**

Run: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test --tests 'org.cardanofoundation.reeve.indexer.service.cards.*' build -x test && JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew test`
Expected: card tests PASS; **watch for pre-existing controller tests breaking under Spring Security** — the `SecurityFilterChain` permits everything outside `/api/v1/cards/**`, and existing tests are plain unit tests (no web context), so no breakage is expected; if a `@WebMvcTest` appears, add `@AutoConfigureMockMvc(addFilters = false)`.

---

### Task 9: Frontend crypto core — codecs, constants, decrypt flow (§2.1/§2.6) + crypto KAT

**Files:**
- Modify: `frontend/package.json` (add `@noble/curves`)
- Create: `frontend/src/libs/document-vault-crypto/codecs.ts`
- Create: `frontend/src/libs/document-vault-crypto/constants.ts`
- Create: `frontend/src/libs/document-vault-crypto/decrypt.ts`
- Create: `frontend/scripts/generate-crypto-kat.mjs`
- Create: `docs/vectors/crypto-kat-v1.json` (generated in Step 4)
- Test: `frontend/src/libs/document-vault-crypto/codecs.spec.ts`
- Test: `frontend/src/libs/document-vault-crypto/decrypt.spec.ts`

**Interfaces:**
- Produces:
  - `hexToBytes(hex: string): Uint8Array`, `bytesToHex(bytes: Uint8Array): string`, `base64ToBytes(b64: string): Uint8Array`, `bytesToBase64(bytes: Uint8Array): string`
  - `SLOT_KEK_INFO`, `SLOT_WRAP_NONCE`, `ENVELOPE_TYPE`
  - `trialDecryptSlots(privateKeyHex: string, slots: EnvelopeSlot[]): Promise<{ dek: Uint8Array; slotIndex: number } | null>`
  - `decryptEnvelope(privateKeyHex: string, envelope: Envelope, onChainPlaintextHashHex: string): Promise<DecryptOutcome | null>` where `DecryptOutcome = { plaintext: Uint8Array; slotIndex: number; plaintextHashHex: string; plaintextHashMatches: boolean }`
- All crypto in the browser: WebCrypto (AES-GCM, HKDF, SHA-256) + `@noble/curves` X25519. **The KAT vector `docs/vectors/crypto-kat-v1.json` is the shared artifact with the Reeve frontend** — an envelope their encryptor produces must open here.

- [ ] **Step 1: `cd frontend && npm install @noble/curves`** — verify it lands in `package.json` `dependencies`.

- [ ] **Step 2: Write failing specs**

`codecs.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { base64ToBytes, bytesToBase64, bytesToHex, hexToBytes } from './codecs'

describe('codecs', () => {
  it('round-trips hex', () => {
    expect(bytesToHex(hexToBytes('00ff10ab'))).toBe('00ff10ab')
  })

  it('rejects odd-length and non-hex input', () => {
    expect(() => hexToBytes('abc')).toThrow()
    expect(() => hexToBytes('zz')).toThrow()
  })

  it('round-trips base64', () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 251, 252])
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes)
  })
})
```

`decrypt.spec.ts` (the KAT — written against the vector pinned in Step 4; write it now, it fails until the vector exists):

```ts
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { bytesToHex } from './codecs'
import { decryptEnvelope, trialDecryptSlots } from './decrypt'

const vectorPath = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../docs/vectors/crypto-kat-v1.json')
const vector = JSON.parse(readFileSync(vectorPath, 'utf-8'))

describe('document-vault crypto KAT (shared with the Reeve frontend)', () => {
  it('decrypts the fixture envelope and verifies the on-chain plaintext hash', async () => {
    const outcome = await decryptEnvelope(vector.recipientPrivateKeyHex, vector.envelope, vector.envelope.plaintext_hash)

    expect(outcome).not.toBeNull()
    expect(bytesToHex(outcome!.plaintext)).toBe(vector.plaintextHex)
    expect(outcome!.plaintextHashHex).toBe(vector.envelope.plaintext_hash)
    expect(outcome!.plaintextHashMatches).toBe(true)
    // Slot 0 is a decoy wrapped to a different key: trial decryption must skip it (I6).
    expect(outcome!.slotIndex).toBe(1)
  })

  it('returns null for a key that opens no slot', async () => {
    const outcome = await decryptEnvelope(vector.strangerPrivateKeyHex, vector.envelope, vector.envelope.plaintext_hash)
    expect(outcome).toBeNull()
  })

  it('GCM rejects a tampered wrapped_dek instead of yielding a wrong DEK', async () => {
    const tampered = structuredClone(vector.envelope)
    const flipped = tampered.slots[1].wrapped_dek.startsWith('0') ? '1' : '0'
    tampered.slots[1].wrapped_dek = flipped + tampered.slots[1].wrapped_dek.slice(1)
    expect(await trialDecryptSlots(vector.recipientPrivateKeyHex, tampered.slots)).toBeNull()
  })

  it('flags a plaintext-hash mismatch against the on-chain value', async () => {
    const outcome = await decryptEnvelope(vector.recipientPrivateKeyHex, vector.envelope, 'f'.repeat(64))
    expect(outcome!.plaintextHashMatches).toBe(false)
  })
})
```

- [ ] **Step 3: Implement**

`codecs.ts`:

```ts
export const hexToBytes = (hex: string): Uint8Array => {
  if (!/^(?:[0-9a-f]{2})*$/.test(hex)) throw new Error('invalid lowercase hex')
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return bytes
}

export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

export const base64ToBytes = (b64: string): Uint8Array => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))

export const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}
```

`constants.ts`:

```ts
// Contract §2.1 - these values are shared with the Reeve frontend. Changing any of them
// makes documents encrypted there unopenable here. The KAT in decrypt.spec.ts pins them.
export const SLOT_KEK_INFO = 'reeve/document-vault/slot-kek/v1'

// Zero nonce is safe ONLY because each slotKEK derives from a single-use ephemeral key (§2.1).
export const SLOT_WRAP_NONCE = new Uint8Array(12)

export const ENVELOPE_TYPE = 'REEVE_ENCRYPTED_DOCUMENT'

export const CARD_PBKDF2_ITERATIONS = 600000
```

`decrypt.ts`:

```ts
import { x25519 } from '@noble/curves/ed25519'

import { base64ToBytes, bytesToHex, hexToBytes } from './codecs'
import { SLOT_KEK_INFO, SLOT_WRAP_NONCE } from './constants'

export type EnvelopeSlot = {
  ephemeral_pub: string
  wrapped_dek: string
}

export type Envelope = {
  version: number
  type: string
  org_id?: string
  content_hash: string
  plaintext_hash: string
  payload: { ciphertext: string; nonce: string }
  slots: EnvelopeSlot[]
}

export type DecryptOutcome = {
  plaintext: Uint8Array
  slotIndex: number
  plaintextHashHex: string
  plaintextHashMatches: boolean
}

const deriveSlotKek = async (sharedSecret: Uint8Array): Promise<CryptoKey> => {
  const ikm = await crypto.subtle.importKey('raw', sharedSecret, 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode(SLOT_KEK_INFO) },
    ikm,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
}

/** §2.6 step 5: GCM-authenticated trial decryption. The FIRST success is authoritative (I6). */
export const trialDecryptSlots = async (
  privateKeyHex: string,
  slots: EnvelopeSlot[]
): Promise<{ dek: Uint8Array; slotIndex: number } | null> => {
  const privateKey = hexToBytes(privateKeyHex)
  try {
    for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
      try {
        const sharedSecret = x25519.getSharedSecret(privateKey, hexToBytes(slots[slotIndex].ephemeral_pub))
        const slotKek = await deriveSlotKek(sharedSecret)
        const dek = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: SLOT_WRAP_NONCE },
          slotKek,
          hexToBytes(slots[slotIndex].wrapped_dek)
        )
        return { dek: new Uint8Array(dek), slotIndex }
      } catch {
        // Wrong slot: GCM authentication rejects wrong keys - that is the mechanism (I6).
      }
    }
    return null
  } finally {
    privateKey.fill(0) // I1: zero key material after use
  }
}

/** §2.6 steps 5-6 against the on-chain plaintext hash - the one check tying ciphertext to a real file. */
export const decryptEnvelope = async (
  privateKeyHex: string,
  envelope: Envelope,
  onChainPlaintextHashHex: string
): Promise<DecryptOutcome | null> => {
  const match = await trialDecryptSlots(privateKeyHex, envelope.slots)
  if (!match) return null
  try {
    const dekKey = await crypto.subtle.importKey('raw', match.dek, 'AES-GCM', false, ['decrypt'])
    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: hexToBytes(envelope.payload.nonce) },
      dekKey,
      base64ToBytes(envelope.payload.ciphertext)
    )
    const plaintext = new Uint8Array(plaintextBuffer)
    const plaintextHashHex = bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', plaintext)))
    return {
      plaintext,
      slotIndex: match.slotIndex,
      plaintextHashHex,
      plaintextHashMatches: plaintextHashHex === onChainPlaintextHashHex
    }
  } catch {
    return null
  } finally {
    match.dek.fill(0) // I1
  }
}
```

- [ ] **Step 4: Generate and pin the crypto KAT.** `frontend/scripts/generate-crypto-kat.mjs` — encrypt-side of §2.1 with FIXED inputs (RFC 7748 keys), writing the vector consumed by the spec above and by the Reeve frontend team:

```js
// Generates docs/vectors/crypto-kat-v1.json - the shared decrypt KAT for the §2.1 constants.
// Run once from frontend/: node scripts/generate-crypto-kat.mjs
import { webcrypto as crypto } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { x25519 } from '@noble/curves/ed25519'

const hex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
const fromHex = (s) => Uint8Array.from(s.match(/.{2}/g).map((b) => parseInt(b, 16)))
const b64 = (bytes) => Buffer.from(bytes).toString('base64')

const SLOT_KEK_INFO = 'reeve/document-vault/slot-kek/v1'
const ZERO_NONCE = new Uint8Array(12)

// RFC 7748 test keys - deterministic and recognisable as test-only.
const recipientPriv = fromHex('77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a')
const decoyPriv = fromHex('5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb')
const ephPrivSlot0 = fromHex('0101010101010101010101010101010101010101010101010101010101010101')
const ephPrivSlot1 = fromHex('0202020202020202020202020202020202020202020202020202020202020202')
const strangerPriv = fromHex('0303030303030303030303030303030303030303030303030303030303030303')
const dek = fromHex('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f')
const payloadNonce = fromHex('000102030405060708090a0b')
const plaintext = new TextEncoder().encode('REEVE DOCUMENT VAULT CRYPTO KAT v1\n')
const orgId = 'f'.repeat(64)

const deriveSlotKek = async (shared) => {
  const ikm = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode(SLOT_KEK_INFO) },
    ikm, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  )
}

const wrapDek = async (ephPriv, recipientPub) => {
  const shared = x25519.getSharedSecret(ephPriv, recipientPub)
  const slotKek = await deriveSlotKek(shared)
  const wrapped = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: ZERO_NONCE }, slotKek, dek)
  return { ephemeral_pub: hex(x25519.getPublicKey(ephPriv)), wrapped_dek: hex(new Uint8Array(wrapped)) }
}

const dekKey = await crypto.subtle.importKey('raw', dek, 'AES-GCM', false, ['encrypt'])
const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: payloadNonce }, dekKey, plaintext))
const contentHash = hex(new Uint8Array(await crypto.subtle.digest('SHA-256', ciphertext)))
const plaintextHash = hex(new Uint8Array(await crypto.subtle.digest('SHA-256', plaintext)))

const vector = {
  description:
    'Shared decrypt KAT for the contract §2.1 constants. Slot 0 is a decoy (different recipient); slot 1 opens with recipientPrivateKeyHex. All keys are RFC 7748 / fixed TEST values.',
  recipientPrivateKeyHex: hex(recipientPriv),
  recipientPublicKeyHex: hex(x25519.getPublicKey(recipientPriv)),
  strangerPrivateKeyHex: hex(strangerPriv),
  plaintextHex: hex(plaintext),
  plaintextUtf8: 'REEVE DOCUMENT VAULT CRYPTO KAT v1\n',
  envelope: {
    version: 1,
    type: 'REEVE_ENCRYPTED_DOCUMENT',
    org_id: orgId,
    content_hash: contentHash,
    plaintext_hash: plaintextHash,
    payload: { ciphertext: b64(ciphertext), nonce: hex(payloadNonce) },
    slots: [await wrapDek(ephPrivSlot0, x25519.getPublicKey(decoyPriv)), await wrapDek(ephPrivSlot1, x25519.getPublicKey(recipientPriv))]
  }
}

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/vectors/crypto-kat-v1.json')
writeFileSync(out, JSON.stringify(vector, null, 2) + '\n')
console.log('pinned', out)
```

Run: `cd frontend && node scripts/generate-crypto-kat.mjs`
Expected: `pinned .../docs/vectors/crypto-kat-v1.json` and the file exists with all hex fields populated.

- [ ] **Step 5: Run the specs**

Run: `cd frontend && npm test -- --run src/libs/document-vault-crypto`
Expected: PASS (all four KAT cases + codecs).

---

### Task 10: Frontend crypto core — key cards (parse/strip/wrap/unwrap) and issuance helpers

**Files:**
- Create: `frontend/src/libs/document-vault-crypto/cards.ts`
- Create: `frontend/src/libs/document-vault-crypto/issue.ts`
- Test: `frontend/src/libs/document-vault-crypto/cards.spec.ts`
- Test: `frontend/src/libs/document-vault-crypto/issue.spec.ts`

**Interfaces:**
- Produces:
  - `KeyCard` type (§2.8.2 shape, camelCase), `PrivateKeySection` type
  - `parseCard(raw: string): KeyCard` (throws on `v !== 1` / wrong `type` — I7: never guess at unknown versions)
  - `stripPrivateKey(card: KeyCard): KeyCard`
  - `unwrapHandoverPrivateKey(card: KeyCard, passphrase: string): Promise<string>` (64-hex private key)
  - `wrapPrivateKey(privateKeyHex: string, passphrase: string): Promise<PrivateKeySection>`
  - `generateKeypair(): { privateKeyHex: string; publicKeyHex: string }`
  - `buildIssueRequest(subject: IssueSubject, publicKeyHex: string, label: string): IssueRequest` — **contains no private-key material by construction; the spec proves it**
  - `assembleHandoverCard(signedCard: KeyCard, privateKeyHex: string, passphrase: string): Promise<KeyCard>`
  - `downloadCardFile(card: KeyCard, fileName: string): void` (Blob + anchor click)

- [ ] **Step 1: Write failing specs**

`cards.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'

import { parseCard, stripPrivateKey, unwrapHandoverPrivateKey, wrapPrivateKey } from './cards'
import type { KeyCard } from './cards'

const baseCard: KeyCard = {
  v: 1,
  type: 'REEVE_KEY_CARD',
  subject: { subjectType: 'EXTERNAL', subjectId: 'uuid-1', organisationId: 'org-1' },
  key: { publicKey: 'ab'.repeat(32), label: 'Test key', assurance: 'PORTABLE', createdAt: '2026-07-14T10:15:30Z' },
  issuer: { issuerId: 'reeve-indexer-test', algorithm: 'Ed25519', publicKey: 'cd'.repeat(32) },
  signature: 'ef'.repeat(64)
}

describe('key cards', () => {
  it('parses a valid card', () => {
    expect(parseCard(JSON.stringify(baseCard)).key.publicKey).toBe('ab'.repeat(32))
  })

  it('rejects unknown versions and wrong types instead of guessing (I7)', () => {
    expect(() => parseCard(JSON.stringify({ ...baseCard, v: 2 }))).toThrow()
    expect(() => parseCard(JSON.stringify({ ...baseCard, type: 'SOMETHING' }))).toThrow()
    expect(() => parseCard('not json')).toThrow()
  })

  it('strips the privateKey section completely', async () => {
    const withPrivate = { ...baseCard, privateKey: await wrapPrivateKey('11'.repeat(32), 'pw') }
    const stripped = stripPrivateKey(withPrivate)
    expect('privateKey' in stripped).toBe(false)
    expect(JSON.stringify(stripped)).not.toContain('wrapped')
  })

  it('round-trips a handover private key through passphrase wrap/unwrap', async () => {
    const privateKeyHex = '11'.repeat(32)
    const card = { ...baseCard, privateKey: await wrapPrivateKey(privateKeyHex, 'correct horse') }
    expect(await unwrapHandoverPrivateKey(card, 'correct horse')).toBe(privateKeyHex)
  })

  it('rejects a wrong passphrase via GCM authentication', async () => {
    const card = { ...baseCard, privateKey: await wrapPrivateKey('11'.repeat(32), 'right') }
    await expect(unwrapHandoverPrivateKey(card, 'wrong')).rejects.toThrow()
  })
})
```

`issue.spec.ts`:

```ts
import { x25519 } from '@noble/curves/ed25519'
import { describe, expect, it } from 'vitest'

import { hexToBytes } from './codecs'
import { assembleHandoverCard, buildIssueRequest, generateKeypair } from './issue'
import type { KeyCard } from './cards'

describe('issuance helpers', () => {
  it('generates a keypair whose public key derives from the private key', () => {
    const { privateKeyHex, publicKeyHex } = generateKeypair()
    expect(publicKeyHex).toHaveLength(64)
    expect(Buffer.from(x25519.getPublicKey(hexToBytes(privateKeyHex))).toString('hex')).toBe(publicKeyHex)
  })

  it('the issue request carries ONLY the public key - never private material (I1/I5)', () => {
    const { privateKeyHex, publicKeyHex } = generateKeypair()
    const request = buildIssueRequest(
      { subjectType: 'EXTERNAL', displayName: 'Aud Itor', email: 'a@b.c', organisationId: 'org-1' },
      publicKeyHex,
      'Audit key'
    )
    const payload = JSON.stringify(request)
    expect(payload).toContain(publicKeyHex)
    expect(payload).not.toContain(privateKeyHex)
    expect(payload).not.toContain('privateKey')
    expect(payload).not.toContain('wrapped')
  })

  it('assembles a handover card with a passphrase-wrapped private key', async () => {
    const signedCard = {
      v: 1, type: 'REEVE_KEY_CARD',
      subject: { subjectType: 'EXTERNAL', subjectId: 'u', organisationId: 'o' },
      key: { publicKey: 'ab'.repeat(32), assurance: 'PORTABLE', createdAt: 't' },
      issuer: { issuerId: 'i', algorithm: 'Ed25519', publicKey: 'cd'.repeat(32) },
      signature: 'ef'.repeat(64)
    } as KeyCard
    const handover = await assembleHandoverCard(signedCard, '11'.repeat(32), 'pw')
    expect(handover.privateKey?.kdf.iterations).toBe(600000)
    expect(handover.privateKey?.wrapped).toHaveLength(96)
    expect(handover.signature).toBe(signedCard.signature) // privateKey is never signed (§2.8.3)
  })
})
```

- [ ] **Step 2: Run to verify failure.**

- [ ] **Step 3: Implement**

`cards.ts`:

```ts
import { bytesToHex, hexToBytes } from './codecs'
import { CARD_PBKDF2_ITERATIONS } from './constants'

export type PrivateKeySection = {
  algorithm: 'AES-256-GCM'
  kdf: { name: 'PBKDF2-HMAC-SHA-256'; iterations: number; salt: string }
  nonce: string
  wrapped: string
}

export type KeyCard = {
  v: number
  type: string
  subject: { subjectType: string; subjectId: string; displayName?: string; email?: string; organisationId: string }
  key: { publicKey: string; label?: string; assurance: string; createdAt: string }
  issuer: { issuerId: string; algorithm: string; publicKey: string }
  signature: string
  privateKey?: PrivateKeySection
}

export const parseCard = (raw: string): KeyCard => {
  const card = JSON.parse(raw) as KeyCard
  // I7: readers that meet an unknown version MUST fail visibly rather than guess.
  if (card.v !== 1) throw new Error(`Unsupported card version: ${card.v}`)
  if (card.type !== 'REEVE_KEY_CARD') throw new Error('Not a REEVE_KEY_CARD')
  if (!card.subject || !card.key || !card.issuer || !card.signature) throw new Error('Malformed card')
  return card
}

export const stripPrivateKey = (card: KeyCard): KeyCard => {
  const { privateKey: _stripped, ...publicCard } = card
  return publicCard
}

const deriveCardKey = async (passphrase: string, saltHex: string, iterations: number, usage: KeyUsage): Promise<CryptoKey> => {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: hexToBytes(saltHex), iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage]
  )
}

/** §2.8.2: cardKey = PBKDF2-HMAC-SHA-256(passphrase, salt, iterations); wrapped = AES-256-GCM(cardKey, nonce, priv). */
export const unwrapHandoverPrivateKey = async (card: KeyCard, passphrase: string): Promise<string> => {
  if (!card.privateKey) throw new Error('This card carries no private key (contact card)')
  const { kdf, nonce, wrapped } = card.privateKey
  const cardKey = await deriveCardKey(passphrase, kdf.salt, kdf.iterations, 'decrypt')
  const privateKey = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: hexToBytes(nonce) }, cardKey, hexToBytes(wrapped))
  return bytesToHex(new Uint8Array(privateKey))
}

export const wrapPrivateKey = async (privateKeyHex: string, passphrase: string): Promise<PrivateKeySection> => {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const nonce = crypto.getRandomValues(new Uint8Array(12))
  const cardKey = await deriveCardKey(passphrase, bytesToHex(salt), CARD_PBKDF2_ITERATIONS, 'encrypt')
  const wrapped = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, cardKey, hexToBytes(privateKeyHex))
  return {
    algorithm: 'AES-256-GCM',
    kdf: { name: 'PBKDF2-HMAC-SHA-256', iterations: CARD_PBKDF2_ITERATIONS, salt: bytesToHex(salt) },
    nonce: bytesToHex(nonce),
    wrapped: bytesToHex(new Uint8Array(wrapped))
  }
}
```

`issue.ts`:

```ts
import { x25519 } from '@noble/curves/ed25519'

import { wrapPrivateKey } from './cards'
import type { KeyCard } from './cards'
import { bytesToHex } from './codecs'

export type IssueSubject = {
  subjectType: 'REEVE_ACCOUNT' | 'EXTERNAL'
  subjectId?: string
  displayName?: string
  email?: string
  organisationId: string
}

export type IssueRequest = {
  subject: IssueSubject
  key: { publicKey: string; label: string }
}

/** The keypair is generated IN THE BROWSER (§9.4). The private half never leaves it. */
export const generateKeypair = (): { privateKeyHex: string; publicKeyHex: string } => {
  const privateKey = x25519.utils.randomPrivateKey()
  const keypair = { privateKeyHex: bytesToHex(privateKey), publicKeyHex: bytesToHex(x25519.getPublicKey(privateKey)) }
  privateKey.fill(0)
  return keypair
}

/** Builds the POST /cards/issue body - public key only, by construction (I1/I5). */
export const buildIssueRequest = (subject: IssueSubject, publicKeyHex: string, label: string): IssueRequest => ({
  subject,
  key: { publicKey: publicKeyHex, label }
})

/** A handover card adds the passphrase-wrapped private key CLIENT-SIDE (§2.8.2). */
export const assembleHandoverCard = async (signedCard: KeyCard, privateKeyHex: string, passphrase: string): Promise<KeyCard> => ({
  ...signedCard,
  privateKey: await wrapPrivateKey(privateKeyHex, passphrase)
})

export const downloadCardFile = (card: KeyCard, fileName: string): void => {
  const blob = new Blob([JSON.stringify(card, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 4: Run the specs**

Run: `cd frontend && npm test -- --run src/libs/document-vault-crypto`
Expected: PASS.

---

### Task 11: Frontend API client + React Query models

**Files:**
- Create: `frontend/src/libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.ts`
- Create: `frontend/src/libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types.ts`
- Create: `frontend/src/libs/api-connectors/backend-connector-reeve/api/cards/cardsApi.ts`
- Create: `frontend/src/libs/api-connectors/backend-connector-reeve/api/cards/cardsApi.types.ts`
- Modify: `frontend/src/libs/api-connectors/backend-connector-reeve/api/backendReeveApi.ts` (register both)
- Create: `frontend/src/libs/models/documents-model/GetDocuments/GetDocuments.service.ts`
- Create: `frontend/src/libs/models/documents-model/GetDocumentDetail/GetDocumentDetail.service.ts`
- Create: `frontend/src/libs/models/documents-model/GetDocumentEnvelope/GetDocumentEnvelope.service.ts`
- Create: `frontend/src/libs/models/cards-model/GetCardStatus/GetCardStatus.service.ts`
- Create: `frontend/src/libs/models/cards-model/GetIssuedCards/GetIssuedCards.service.ts`
- Create: `frontend/src/libs/models/cards-model/IssueCard/IssueCard.service.ts`

**Interfaces:**
- Consumes: the existing `httpService`/`sendRequest` layer — **mirror `api/events/publicEventsApi.ts` exactly** for factory shape, header handling (`hasAuthorizationHeader`/`Authorization: ''` suppression) and how the factory is registered in `backendReeveApi.ts`. The code below matches the described pattern; adapt call signatures to the real `httpService` before compiling.
- Produces (types mirror the wire — snake_case for documents, camelCase for cards):

`documentsApi.types.ts`:

```ts
export type CheckStatus = 'PASS' | 'FAIL' | 'PENDING'

export type DocumentVerdict =
  | 'VERIFIED'
  | 'MALFORMED_MANIFEST'
  | 'PUBLISHER_UNKNOWN'
  | 'IPFS_UNAVAILABLE'
  | 'CONTENT_HASH_MISMATCH'
  | 'MALFORMED_ENVELOPE'
  | 'PENDING'

export type DocumentChecks = {
  manifest: CheckStatus
  publisher: CheckStatus
  ipfs: CheckStatus
  content_hash: CheckStatus
  envelope: CheckStatus
}

export type DocumentView = {
  tx_hash: string
  document_id: string | null
  organisation_id: string | null
  ipfs_cid: string | null
  content_hash: string | null
  plaintext_hash: string | null
  envelope_version: number | null
  slot_count: number | null
  slot: number | null
  block_time: number | null
  checks: DocumentChecks
  verdict: DocumentVerdict
  created_at: string
}

export type DocumentListResponse = {
  content: DocumentView[]
  total: number
  total_pages: number
  page: number
  size: number
}

export type DocumentDetailResponse = {
  document_id: string
  anchors: DocumentView[]
  duplicate_anchors: boolean
}

export type GetDocumentsParams = {
  orgId?: string
  verdict?: DocumentVerdict
  page?: number
  size?: number
  sort?: string
}
```

`cardsApi.types.ts`:

```ts
import type { KeyCard } from 'libs/document-vault-crypto/cards'
import type { IssueRequest } from 'libs/document-vault-crypto/issue'

export type CardStatusResponse = { issuance_enabled: boolean }

export type IssuedCardRegistryEntry = {
  card_id: string
  subject_type: string
  subject_id: string
  display_name: string | null
  email: string | null
  organisation_id: string
  public_key: string
  label: string | null
  assurance: string
  created_at_signed: string
  issuer_id: string
  created_at: string
}

export type IssuedCardsResponse = {
  content: IssuedCardRegistryEntry[]
  total: number
  total_pages: number
  page: number
  size: number
}

export type IssuerCredentials = { username: string; password: string }

export type { IssueRequest, KeyCard }
```

`documentsApi.ts` (factory pattern; endpoints are public so the bearer header is suppressed like the other public APIs):

```ts
import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService'

import type { DocumentDetailResponse, DocumentListResponse, GetDocumentsParams } from './documentsApi.types'

export const documentsApi = (baseUrl: string) => {
  const http = httpService(baseUrl)

  const getDocuments = async (params: GetDocumentsParams): Promise<DocumentListResponse> => {
    const query = new URLSearchParams()
    if (params.orgId) query.set('orgId', params.orgId)
    if (params.verdict) query.set('verdict', params.verdict)
    query.set('page', String(params.page ?? 0))
    query.set('size', String(params.size ?? 20))
    if (params.sort) query.set('sort', params.sort)
    return http.get(`/documents?${query.toString()}`, { headers: { Authorization: '' } })
  }

  const getDocumentDetail = async (documentId: string): Promise<DocumentDetailResponse> =>
    http.get(`/documents/${encodeURIComponent(documentId)}`, { headers: { Authorization: '' } })

  const getDocumentEnvelope = async (documentId: string, txHash?: string): Promise<unknown> =>
    http.get(
      `/documents/${encodeURIComponent(documentId)}/envelope${txHash ? `?txHash=${encodeURIComponent(txHash)}` : ''}`,
      { headers: { Authorization: '' } }
    )

  return { getDocuments, getDocumentDetail, getDocumentEnvelope }
}
```

`cardsApi.ts` (issuance is authenticated — HTTP Basic from operator-entered, in-memory credentials):

```ts
import { httpService } from 'libs/api-connectors/backend-connector-reeve/api/httpService'
import type { KeyCard } from 'libs/document-vault-crypto/cards'
import type { IssueRequest } from 'libs/document-vault-crypto/issue'

import type { CardStatusResponse, IssuedCardsResponse, IssuerCredentials } from './cardsApi.types'

const basicAuthHeader = ({ username, password }: IssuerCredentials) => ({
  Authorization: `Basic ${btoa(`${username}:${password}`)}`
})

export const cardsApi = (baseUrl: string) => {
  const http = httpService(baseUrl)

  const getStatus = async (): Promise<CardStatusResponse> => http.get('/cards/status', { headers: { Authorization: '' } })

  const issueCard = async (request: IssueRequest, credentials: IssuerCredentials): Promise<KeyCard> =>
    http.post('/cards/issue', request, { headers: basicAuthHeader(credentials) })

  const getIssuedCards = async (
    params: { orgId?: string; page?: number; size?: number },
    credentials: IssuerCredentials
  ): Promise<IssuedCardsResponse> => {
    const query = new URLSearchParams()
    if (params.orgId) query.set('orgId', params.orgId)
    query.set('page', String(params.page ?? 0))
    query.set('size', String(params.size ?? 20))
    return http.get(`/cards?${query.toString()}`, { headers: basicAuthHeader(credentials) })
  }

  const exportCard = async (cardId: string, credentials: IssuerCredentials): Promise<KeyCard> =>
    http.get(`/cards/${encodeURIComponent(cardId)}/export`, { headers: basicAuthHeader(credentials) })

  return { getStatus, issueCard, getIssuedCards, exportCard }
}
```

Register in `backendReeveApi.ts` following the existing aggregator pattern (add `documentsApi: documentsApi(apiUrl)` and `cardsApi: cardsApi(apiUrl)` to the returned object).

Models — one hook per action, mirroring `GetOrganisations.service.ts`:

```ts
// GetDocuments.service.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import type { GetDocumentsParams } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'

export const useGetDocumentsModel = (params: GetDocumentsParams) => {
  const { data, isFetching, isError } = useQuery({
    queryKey: ['DOCUMENTS', params],
    queryFn: () => backendReeveApi().documentsApi.getDocuments(params),
    placeholderData: keepPreviousData
  })

  return { documents: data ?? null, isFetching, isError }
}
```

```ts
// GetDocumentDetail.service.ts
import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

export const useGetDocumentDetailModel = (documentId: string | undefined) => {
  const { data, isFetching, isError } = useQuery({
    queryKey: ['DOCUMENT_DETAIL', documentId],
    queryFn: () => backendReeveApi().documentsApi.getDocumentDetail(documentId as string),
    enabled: Boolean(documentId)
  })

  return { detail: data ?? null, isFetching, isError }
}
```

```ts
// GetDocumentEnvelope.service.ts - lazy: decryption must be a deliberate gesture (I3),
// so the envelope is fetched on demand, not on page load.
import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import type { Envelope } from 'libs/document-vault-crypto/decrypt'

export const useGetDocumentEnvelopeModel = () => {
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: ({ documentId, txHash }: { documentId: string; txHash?: string }) =>
      backendReeveApi().documentsApi.getDocumentEnvelope(documentId, txHash) as Promise<Envelope>
  })

  return { fetchEnvelope: mutateAsync, isFetching: isPending, isError }
}
```

```ts
// GetCardStatus.service.ts
import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'

export const useGetCardStatusModel = () => {
  const { data, isFetching } = useQuery({
    queryKey: ['CARD_STATUS'],
    queryFn: () => backendReeveApi().cardsApi.getStatus()
  })

  return { issuanceEnabled: data?.issuance_enabled ?? false, isFetching }
}
```

```ts
// GetIssuedCards.service.ts
import { useQuery } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import type { IssuerCredentials } from 'libs/api-connectors/backend-connector-reeve/api/cards/cardsApi.types'

export const useGetIssuedCardsModel = (
  params: { orgId?: string; page?: number; size?: number },
  credentials: IssuerCredentials | null
) => {
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ['ISSUED_CARDS', params],
    queryFn: () => backendReeveApi().cardsApi.getIssuedCards(params, credentials as IssuerCredentials),
    enabled: Boolean(credentials)
  })

  return { cards: data ?? null, isFetching, isError, refetch }
}
```

```ts
// IssueCard.service.ts
import { useMutation } from '@tanstack/react-query'

import { backendReeveApi } from 'libs/api-connectors/backend-connector-reeve/api/backendReeveApi'
import type { IssuerCredentials } from 'libs/api-connectors/backend-connector-reeve/api/cards/cardsApi.types'
import type { IssueRequest } from 'libs/document-vault-crypto/issue'

export const useIssueCardModel = () => {
  const { mutateAsync, isPending, isError, error } = useMutation({
    mutationFn: ({ request, credentials }: { request: IssueRequest; credentials: IssuerCredentials }) =>
      backendReeveApi().cardsApi.issueCard(request, credentials)
  })

  return { issueCard: mutateAsync, isIssuing: isPending, isError, error }
}
```

- [ ] **Step: Type-check** — Run: `cd frontend && npm run ts`
Expected: clean. (These are wiring files; behavioural coverage arrives with the views and the payload-capture spec already in Task 10.)

---

### Task 12: Documents list view (public, org-scoped)

**Files:**
- Create: `frontend/src/modules/public-documents/view/ViewPublicDocuments.component.tsx`
- Create: `frontend/src/modules/public-documents/components/VerdictChip/VerdictChip.component.tsx`
- Create: `frontend/src/modules/public-documents/components/HonestLimits/HonestLimits.component.tsx`
- Create: `frontend/src/modules/public-documents/constants/documents.consts.ts`
- Create: `frontend/src/modules/public-documents/hooks/usePublicDocuments.ts`
- Modify: `frontend/src/routes/index.tsx` (routes `documents`, `documents/:organisationId`, `documents/:organisationId/detail/:documentId`, `cards`)
- Test: `frontend/src/modules/public-documents/components/VerdictChip/VerdictChip.spec.tsx`

**Interfaces:**
- Consumes: `useGetDocumentsModel` (Task 11), `LayoutPublic` + `useLayoutPublicContext` (existing — mirror `ViewPublicEvents` for the shell), MUI components.
- Produces: routes `ROUTES.PUBLIC_DOCUMENTS`, `ROUTES.PUBLIC_DOCUMENTS_WITH_ORG`, `ROUTES.PUBLIC_DOCUMENT_DETAIL`, `ROUTES.CARD_ISSUANCE`; `VerdictChip` reused by the detail view.

**Non-negotiable UI rules (contract §9.3):**
1. A `PUBLISHER_UNKNOWN` row renders as a **warning** (amber row background, warning icon, copy "Anchored by an unknown wallet — not attributable to this organisation"), never styled as a document; its row action leads to the same detail page, which repeats the warning.
2. The list is **hash-identified**: columns are document id, slot/date, hashes (truncated with copy button), slot count, verdict. There is no file-name column — the data cannot contain one (I10), and the UI must not fake one.
3. The two honest limits are stated on the page (the `HonestLimits` component): (a) *"VERIFIED means: the bytes on IPFS are exactly the bytes this organisation anchored on Cardano. It does NOT check the encrypted content against a real file — only a key holder can do that, by decrypting."* (b) *"'Publisher is known' attests the Reeve deployment's platform wallet, not the organisation itself — no per-org publishing key exists."*

- [ ] **Step 1: Write the failing VerdictChip spec**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { VerdictChip } from './VerdictChip.component'

describe('VerdictChip', () => {
  it('renders VERIFIED as success', () => {
    render(<VerdictChip verdict="VERIFIED" />)
    expect(screen.getByText('VERIFIED')).toBeInTheDocument()
  })

  it('renders PUBLISHER_UNKNOWN as a warning, never as a plain document state', () => {
    render(<VerdictChip verdict="PUBLISHER_UNKNOWN" />)
    const chip = screen.getByText('PUBLISHER_UNKNOWN')
    expect(chip.closest('.MuiChip-colorWarning')).not.toBeNull()
  })

  it('renders hash mismatches and malformed states as errors', () => {
    render(<VerdictChip verdict="CONTENT_HASH_MISMATCH" />)
    expect(screen.getByText('CONTENT_HASH_MISMATCH').closest('.MuiChip-colorError')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Implement `VerdictChip`**

```tsx
import { Chip } from '@mui/material'

import type { DocumentVerdict } from 'libs/api-connectors/backend-connector-reeve/api/documents/documentsApi.types'

type VerdictChipProps = { verdict: DocumentVerdict }

const VERDICT_COLOR: Record<DocumentVerdict, 'success' | 'warning' | 'error' | 'default'> = {
  VERIFIED: 'success',
  PUBLISHER_UNKNOWN: 'warning',
  MALFORMED_MANIFEST: 'error',
  IPFS_UNAVAILABLE: 'warning',
  CONTENT_HASH_MISMATCH: 'error',
  MALFORMED_ENVELOPE: 'error',
  PENDING: 'default'
}

export const VerdictChip = ({ verdict }: VerdictChipProps) => (
  <Chip color={VERDICT_COLOR[verdict]} label={verdict} size="small" variant={verdict === 'VERIFIED' ? 'filled' : 'outlined'} />
)
```

- [ ] **Step 3: Implement constants, hook, HonestLimits, and the view.** `documents.consts.ts` holds the copy (including the two honest-limit sentences verbatim from the rules above) and column labels. `usePublicDocuments.ts` wires org param + pagination + verdict filter state to `useGetDocumentsModel` (mirror `usePublicTransactions`'s state-orchestration shape, simplified: `page`, `size`, `verdict`, setters). `ViewPublicDocuments.component.tsx` renders inside `LayoutPublic` exactly like `ViewPublicEvents` does: header, `HonestLimits` info panel (MUI `Alert severity="info"`), verdict filter (MUI `Select`), MUI `Table` with columns [document id (mono, truncated), slot, block time (formatted with dayjs like the rest of the app), content hash (truncated + copy), slots, verdict (`VerdictChip`)], `TablePagination` bound to `total`. Rows with `verdict === 'PUBLISHER_UNKNOWN'` get `sx={{ backgroundColor: 'warning.light' }}` and a leading `WarningAmber` icon next to the document id. Row click navigates to `/documents/{organisationId}/detail/{document_id}` (only when `document_id` is non-null; malformed rows without an id are not clickable and show a "malformed anchor" placeholder id of the tx hash).

- [ ] **Step 4: Register routes** in `frontend/src/routes/index.tsx` following the existing table: add to `ROUTES`: `PUBLIC_DOCUMENTS: 'documents'`, `PUBLIC_DOCUMENTS_WITH_ORG: 'documents/:organisationId'`, `PUBLIC_DOCUMENT_DETAIL: 'documents/:organisationId/detail/:documentId'`, `CARD_ISSUANCE: 'cards'`; add to `PATHS`: `PUBLIC_DOCUMENTS`; extend `getOrgPath`'s union type with `'documents'`; add `<Route>` entries — documents list + detail wrapped in `ProtectedRoute` (org gate) like the other org views, `CARD_ISSUANCE` **unwrapped** (no org needed; auth is handled by the backend, not the router). Import the two view components (detail view lands in Task 13 — add its route entry there to keep this task compiling: here add only list + cards route stubs that exist).
  Note: to keep Task 12 self-contained, add ONLY the `documents` routes here; Task 13 adds the detail route, Task 14 the cards route.

- [ ] **Step 5: Verify**

Run: `cd frontend && npm test -- --run src/modules/public-documents && npm run ts && npm run lint`
Expected: spec PASS, type-check and lint clean.

---

### Task 13: Document detail + in-browser decrypt panel

**Files:**
- Create: `frontend/src/modules/public-document-detail/view/ViewPublicDocumentDetail.component.tsx`
- Create: `frontend/src/modules/public-document-detail/components/ChecksList/ChecksList.component.tsx`
- Create: `frontend/src/modules/public-document-detail/components/DecryptPanel/DecryptPanel.component.tsx`
- Create: `frontend/src/modules/public-document-detail/components/DecryptPanel/DecryptPanel.hooks.ts`
- Create: `frontend/src/modules/public-document-detail/constants/detail.consts.ts`
- Modify: `frontend/src/libs/api-connectors/backend-connector-reeve/const/envs.ts` (add `APP_EXPLORER_URL`, `APP_IPFS_GATEWAY_URL` — same `import.meta.env || window.env` pattern as `APP_API_URL`; env vars `VITE_EXPLORER_URL`, `VITE_IPFS_GATEWAY_URL`)
- Modify: `frontend/src/routes/index.tsx` (detail route)
- Modify: `frontend/.env.example` (document the two new vars)
- Test: `frontend/src/modules/public-document-detail/components/DecryptPanel/DecryptPanel.hooks.spec.ts`

**Interfaces:**
- Consumes: `useGetDocumentDetailModel`, `useGetDocumentEnvelopeModel` (Task 11); `parseCard`, `unwrapHandoverPrivateKey` (Task 10); `decryptEnvelope` (Task 9); `VerdictChip` (Task 12).
- Produces: the verification page an auditor lands on — **no login anywhere on this path**.

**Behaviour:**
- `ChecksList` renders the five checks in contract order with per-check status icons (`PASS` ✓ green, `FAIL` ✕ red, `PENDING` ⏳ grey) and one line of copy per check explaining what it proves; below the list, the honest-limit copy (from Task 12 consts) plus, when `verdict === 'VERIFIED'`, the §9.3 claim verbatim: *"The bytes on IPFS are exactly the bytes this organisation anchored on Cardano, at this slot, and nobody has swapped them since."*
- `duplicate_anchors === true` renders a prominent warning: multiple on-chain anchors claim this document id (a substitution/forgery signal); each anchor is shown with its own checks; the decrypt panel then requires choosing an anchor (passes `txHash`).
- Links: L1 explorer (`APP_EXPLORER_URL` + tx hash) and raw IPFS (`APP_IPFS_GATEWAY_URL` + cid), composed client-side per §9.5.
- `DecryptPanel` (the §2.6 flow, all in-browser):
  1. Key input: file-drop/upload of a card JSON **or** a raw 64-hex private key field. A card with a `privateKey` section prompts for the passphrase and unwraps locally (`unwrapHandoverPrivateKey`).
  2. On the user's click (never on load — I3): fetch the envelope via the proxy (`useGetDocumentEnvelopeModel`), run `decryptEnvelope(privateKeyHex, envelope, anchor.plaintext_hash)` — the comparison hash is the **on-chain** one from the anchor, not the envelope's copy.
  3. Outcomes: no slot opens → *"None of your keys can open this document."*; success → plaintext-hash verdict banner (match: *"Decrypted content matches the on-chain plaintext hash — this ciphertext IS this file."* / mismatch: red *"Decrypted content does NOT match the on-chain plaintext hash."*), byte size, and a download button (`Blob` → anchor download, generic filename `document-<documentId>.bin` — the real name is PII and never left Reeve).
  4. The private key lives in component state only, is zeroed/cleared on unmount and after decrypt; it is never logged, stored, or sent — the only network calls on this page are the two public GETs.
- `DecryptPanel.hooks.ts` exports `useDecryptPanel({ anchor })` holding that state machine (`idle → keyReady → decrypting → success | failure`), so the spec can drive it without DOM crypto mocking; spec covers: raw-key path sets `keyReady`, card-without-private-key requires nothing extra, `reset()` clears the key material.

- [ ] **Step 1: Write the failing hook spec** (use `@testing-library/react` `renderHook`; feed it a fake envelope fetcher + fake decryptor via the hook's injectable params — design the hook with `deps?: { fetchEnvelope, decrypt }` defaulting to the real implementations, so the spec swaps them without module mocking).
- [ ] **Step 2: Implement `DecryptPanel.hooks.ts`, run spec** — PASS.
- [ ] **Step 3: Implement the components + view + route + envs**, mirroring the layout patterns of Task 12's view.
- [ ] **Step 4: Verify**

Run: `cd frontend && npm test -- --run src/modules/public-document-detail && npm run ts && npm run lint`
Expected: PASS/clean.

---

### Task 14: Card issuance view (operator, authenticated)

**Files:**
- Create: `frontend/src/modules/card-issuance/view/ViewCardIssuance.component.tsx`
- Create: `frontend/src/modules/card-issuance/components/IssuerLogin/IssuerLogin.component.tsx`
- Create: `frontend/src/modules/card-issuance/components/IssueCardForm/IssueCardForm.component.tsx`
- Create: `frontend/src/modules/card-issuance/components/IssueCardForm/IssueCardForm.hooks.ts`
- Create: `frontend/src/modules/card-issuance/components/CardRegistry/CardRegistry.component.tsx`
- Create: `frontend/src/modules/card-issuance/constants/issuance.consts.ts`
- Modify: `frontend/src/routes/index.tsx` (cards route)
- Test: `frontend/src/modules/card-issuance/components/IssueCardForm/IssueCardForm.hooks.spec.ts`

**Interfaces:**
- Consumes: `useGetCardStatusModel`, `useIssueCardModel`, `useGetIssuedCardsModel` (Task 11); `generateKeypair`, `buildIssueRequest`, `assembleHandoverCard`, `downloadCardFile` (Task 10); `stripPrivateKey` (Task 10).

**Behaviour:**
- Status probe first: `issuance_enabled === false` → the whole view is one message ("This deployment has no card issuer configured") — no forms.
- `IssuerLogin`: username/password fields kept **in React state only** (never persisted — no sessionStorage, no cookies); a "log out" clears them. Wrong creds surface the 401 as "invalid operator credentials".
- `IssueCardForm` flow (`IssueCardForm.hooks.ts` = the state machine, spec-covered):
  1. Subject: `subjectType` select. **REEVE_ACCOUNT** shows the `subjectId` field with the exact guidance copy: *"Paste the holder's Keycloak `sub` (Keycloak → Users → the user → ID). This is what makes the key land in THEIR account — a wrong value creates a contact nobody owns: documents get encrypted to it and the intended holder cannot open them."* **EXTERNAL** hides it (server mints the id) with copy *"For holders without a Reeve login (external auditors). They decrypt published documents here in the Indexer."*
  2. displayName, email, organisationId, key label fields.
  3. "Generate keypair & issue": `generateKeypair()` in the browser → `buildIssueRequest` (public key only) → `useIssueCardModel`.
  4. On success: download buttons — **contact card** (the signed response verbatim) and **handover card** (passphrase field + confirm, `assembleHandoverCard` wraps the private key client-side, warning copy: *"The passphrase travels out of band — never with the card."*). The private key hex is shown once with a "copied/downloaded, discard" confirmation, then wiped from state.
  5. The hook keeps `privateKeyHex` in a ref cleared by `discardKey()` and on unmount. Spec proves: issue request built by the hook contains no private material (re-uses the Task 10 assertion pattern at hook level), and `discardKey()` empties the ref.
- `CardRegistry`: authenticated table of issued cards (public parts), with "re-export contact card" (GET `/cards/{id}/export` → `downloadCardFile`) — how a lost card is replaced or a recipient joins a second org's addressbook.
- Route `cards` added, NOT wrapped in `ProtectedRoute` (no org gate; backend enforces auth).

- [ ] **Step 1: Write the failing `IssueCardForm.hooks` spec** (renderHook; fake `issueCard` dep injected like Task 13's hook: assert request payload has no `privateKey`/private hex; assert `discardKey()` clears).
- [ ] **Step 2: Implement hook, run spec** — PASS.
- [ ] **Step 3: Implement components + view + route.**
- [ ] **Step 4: Verify**

Run: `cd frontend && npm test -- --run src/modules/card-issuance && npm run ts && npm run lint`
Expected: PASS/clean.

---

### Task 15: Full verification gate

**Files:** none (verification only).

- [ ] **Step 1: Backend** — Run: `JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew clean test`
Expected: BUILD SUCCESSFUL, all tests (pre-existing + new) pass. Paste the summary output.
- [ ] **Step 2: Frontend tests** — Run: `cd frontend && npm test -- --run`
Expected: all specs pass. Paste the summary.
- [ ] **Step 3: Frontend type + lint + build** — Run: `cd frontend && npm run ts && npm run lint && npm run build`
Expected: all clean. Paste failures verbatim if any and fix before proceeding.
- [ ] **Step 4: Vector sanity** — confirm `docs/vectors/keycard-signing-vector-v1.json` and `docs/vectors/crypto-kat-v1.json` exist, contain no `<PIN>` placeholders, and that `KeyCardGoldenVectorTest` + `decrypt.spec.ts` consume them (grep the test files for the paths).
- [ ] **Step 5: Independence audit** — `grep -ri "reeve.*database\|jdbc.*reeve\|lob\." src/main/java --include='*.java'` style sweep confirming no new datasource, feign/rest client, or config pointing at Reeve; the only external inputs remain yaci-store and `ipfs.gateway`.

## Plan self-review notes

- Spec coverage: §9.2 rows (Tasks 1–4), §9.3 five checks + verdicts (2–5), §9.6 API (6, 8), §9.4 issuance + registry + browser keygen (7, 8, 10, 14), §9.5 config (3, 5, 8, 13), §2.8.3 byte-exact input + shared golden vector (7), §2.1/§2.6 crypto core + shared KAT (9, 10), honest limits in UI (12, 13), PUBLISHER_UNKNOWN-as-warning (12, 13), no-login verification (6, 12, 13), PII absence (6, 12), I1/I5 payload-capture proofs (10, 14).
- Known deliberate scope cuts (documented in spec §8): no rollback pruning of document rows (matches existing repo behaviour for all types), issuance auth is single-operator Basic (OIDC is a deployment upgrade), UI copy inline in module consts rather than react-intl keys (the repo mixes both; move to `en-US.json` on team preference).
- Cross-team artifacts: `docs/vectors/keycard-signing-vector-v1.json` (Reeve backend importer KAT) and `docs/vectors/crypto-kat-v1.json` (Reeve frontend encryptor KAT) — hand both files to those teams; do not let them re-derive.





