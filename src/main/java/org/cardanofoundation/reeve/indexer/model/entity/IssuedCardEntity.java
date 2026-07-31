package org.cardanofoundation.reeve.indexer.model.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;

import lombok.*;

/** Registry of issued key cards — PUBLIC parts only. No private-key column exists, ever. */
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
    // attestation_aid != null (the AID + the KEL anchor below are the core of the attestation).
    // NOTHING here is published to Cardano — see CardAttestService's javadoc.
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

    // --- KEL anchor (V1.10): the wallet's own attestation of this card. THE proof (V1.12 removed the
    // on-chain tx hash that used to sit alongside it), verifiable from the card file alone ---
    /** Sequence number of the wallet KEL interaction (ixn) event anchoring this card. */
    @Column(name = "attestation_kel_sequence")
    private String attestationKelSequence;
    /** SAID of that KEL event, so a verifier can confirm it read the event it was pointed at. */
    @Column(name = "attestation_kel_event_said")
    private String attestationKelEventSaid;
    /** The metadata label the anchored payload was built with, stored as the exact STRING fed into
     *  the payload SAID — see the V1.10 migration for why a number would be ambiguous. */
    @Column(name = "attestation_metadata_label")
    private String attestationMetadataLabel;
    /**
     * INFORMATIONAL ONLY — the digest this indexer computed over the card body.
     *
     * <p>A verifier MUST recompute it from the card JSON minus the attestation block and compare;
     * these are carried so a mismatch can be reported precisely, NOT so they can be trusted. The same
     * party supplied both this claim and the anchor it would be checked against, so accepting it as
     * given makes the verification vacuous.
     */
    @Column(name = "attestation_card_digest")
    private String attestationCardDigest;
    /** INFORMATIONAL ONLY, exactly as {@link #attestationCardDigest} — the payload SAID the wallet
     *  anchored, which a verifier must re-derive from the recomputed digest. */
    @Column(name = "attestation_payload_said")
    private String attestationPayloadSaid;
    /**
     * The full CESR chain of the presented credential, captured at attestation time. Carried on the
     * exported card so a consumer (the platform's import verification) can re-validate the
     * credential itself — it can only resolve the AID's OOBI, not fetch this credential, on its own.
     * TEXT (a chain can be large); nullable like the other attestation_* columns.
     */
    @Column(name = "attestation_credential_cesr", columnDefinition = "text")
    private String attestationCredentialCesr;
}
