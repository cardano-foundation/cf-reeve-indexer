package org.cardanofoundation.reeve.indexer.model.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.cardanofoundation.reeve.indexer.model.domain.ceremony.CardCeremonyState;

/**
 * A single card-attestation ceremony (design doc Part A / A3): the indexer's own KERI agent
 * pairing with a Veridian wallet, that wallet presenting a credential, then anchoring a CIP-170
 * ATTEST for {@link #cardId}.
 *
 * <p>Deliberately simpler than the platform's {@code keri_attestation} module's {@code
 * KeriAttestationCeremonyEntity}: there is no per-user identity link, no {@code AUTH_BEGIN} step,
 * and no {@code bindingVersion}/relink concept — one card, one ceremony, one wallet AID pairs,
 * presents, and attests it directly, so {@link #walletAid}/{@link #walletOobiUrl} live on the
 * ceremony row itself rather than on a separate identity-link entity.
 *
 * <p>There is deliberately no {@code @Version} column — concurrent step completions CAS on
 * {@code (state, attemptGeneration)} explicitly at the service layer ({@code CardCeremonyService})
 * instead of relying on JPA optimistic locking, since a retry legitimately re-enters the same
 * waiting state with a bumped generation rather than failing outright.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "reeve_card_attestation_ceremony")
public class CardAttestationCeremonyEntity {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    /** The card being attested — {@link IssuedCardEntity#getCardId()}. */
    @Column(name = "card_id", nullable = false)
    private UUID cardId;

    /** The Veridian wallet AID paired with, populated once the PAIRED step completes. */
    @Column(name = "wallet_aid")
    private String walletAid;

    /** The wallet's OOBI URL, as supplied by the user during pairing. */
    @Column(name = "wallet_oobi_url")
    private String walletOobiUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 32)
    private CardCeremonyState state;

    /** Bumped on every retry of the step currently being waited on; {@code CardCeremonyService}'s
     *  {@code completeStep}/{@code failStep}/{@code updateWaitingStepData} CAS on {@code (state,
     *  attemptGeneration)} so a superseded attempt's late completion/failure is silently discarded
     *  rather than corrupting newer state. */
    @Column(name = "attempt_generation", nullable = false)
    private int attemptGeneration;

    // --- waiting-step data, populated as the ceremony progresses (consumed by A4/A5) ---

    /** SAID of the last sent IPEX exchange (apply/offer/grant), used to correlate the matching
     *  wallet notification ({@code KeriNotificationCorrelator}) and to detect a late-arriving reply
     *  before a retry re-sends. */
    @Column(name = "request_exn_said")
    private String requestExnSaid;

    /** SAID of the saidified remotesign request payload sent to the wallet for the ATTEST step —
     *  the value the wallet's KEL interaction-event seal is expected to equal. */
    @Column(name = "payload_said")
    private String payloadSaid;

    /** The wallet's KEL sequence (hex), queried and persisted BEFORE the remotesign request is
     *  sent for the ATTEST step. Any anchoring event accepted for this ceremony must be at or after
     *  this floor, so a stale KEL event carrying the same digest can never satisfy a fresh request. */
    @Column(name = "kel_floor_sequence", length = 64)
    private String kelFloorSequence;

    /** KEL sequence (hex) of the anchoring event, once found. */
    @Column(name = "kel_sequence", length = 64)
    private String kelSequence;

    /** SAID of the anchoring KEL event, kept for audit alongside {@link #kelSequence}. */
    @Column(name = "kel_event_said")
    private String kelEventSaid;

    /** SAID of the presented credential. */
    @Column(name = "credential_said")
    private String credentialSaid;

    /** SAID of the presented credential's schema. */
    @Column(name = "schema_said")
    private String schemaSaid;

    @Column(name = "error_title")
    private String errorTitle;

    @Column(name = "error_detail", length = 1024)
    private String errorDetail;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /** TTL deadline, set by {@code CardCeremonyService#create}. Lazily transitions the ceremony to
     *  {@code EXPIRED} once passed, the same way a read reports/persists it — see {@code
     *  CardCeremonyService}'s lazy-expiry check. */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
