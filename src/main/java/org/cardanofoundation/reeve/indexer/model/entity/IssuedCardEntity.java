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
    /** The ISO-8601 instant recorded as the card's key.createdAt. */
    @Column(name = "key_created_at", nullable = false)
    private String keyCreatedAt;

    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Veridian attestation ceremony fields (populated later, by the ceremony — not at issue time).
    // A card is issued first and attested later, so these are all nullable; "attested" is treated as
    // attestation_aid != null (the AID + tx are the core of the attestation).
    /** Wallet OOBI: how to resolve the attesting AID. */
    @Column(name = "attestation_oobi")
    private String attestationOobi;
    /** The wallet AID that attested this card. */
    @Column(name = "attestation_aid")
    private String attestationAid;
    /** SAID of the presented credential. */
    @Column(name = "attestation_credential_said")
    private String attestationCredentialSaid;
    /** SAID of the presented credential's schema. */
    @Column(name = "attestation_schema_said")
    private String attestationSchemaSaid;
    /** Cardano tx hash of the CIP-170 ATTEST anchoring this card. */
    @Column(name = "attestation_tx_hash")
    private String attestationTxHash;
}
