package org.cardanofoundation.reeve.indexer.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Consumer;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.cardanofoundation.reeve.indexer.model.domain.ceremony.CardCeremonyState;
import org.cardanofoundation.reeve.indexer.model.entity.CardAttestationCeremonyEntity;
import org.cardanofoundation.reeve.indexer.model.repository.CardAttestationCeremonyRepository;

/**
 * The card-attestation ceremony state machine (design doc Part A / A3). Every transition takes the
 * row lock via {@link CardAttestationCeremonyRepository#findByIdForUpdate(UUID)} so a retry bumping
 * {@code attemptGeneration} and a late step-completion reading the pre-bump generation can never
 * interleave — the CAS in {@link #completeStep}, {@link #failStep} and {@link
 * #updateWaitingStepData} is only race-free because the read-modify-write happens under that lock,
 * inside this class's (default) {@code @Transactional} boundary.
 *
 * <p>Ported from the platform's {@code keri_attestation} module's {@code CeremonyService}, keeping
 * only the CORE state-machine mechanics: row-locked reads, the {@code (state, attemptGeneration)}
 * CAS, and lazy expiry. Deliberately dropped: the per-user identity link / fast-forward, {@code
 * bindingVersion} / relink invalidation, the {@code AUTH_BEGIN} step, and the per-user
 * active-ceremony limit — none of those concepts exist in the indexer's single-agent, one-card-one-
 * ceremony shape (design doc Part A: "the card ceremony is SIMPLER than the platform's document
 * ceremony"). There is also no {@code vavr} dependency here: failures that a caller must react to
 * synchronously are plain exceptions ({@link CardCeremonyNotFoundException}, {@link
 * CardCeremonyInvalidStateException}, {@link CardCeremonyExpiredException} — mirroring {@link
 * KeriOobiValidationException}'s style), while the CAS methods ({@link #completeStep}, {@link
 * #failStep}, {@link #updateWaitingStepData}) keep the reference's own idiom of a silent no-op
 * (boolean/void return) for a superseded attempt, since there is no way to report that back to
 * whichever caller lost the race.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CardCeremonyService {

    /** How long a ceremony may sit un-finished before {@link #lazilyExpireIfNeeded} moves it to
     *  {@link CardCeremonyState#EXPIRED}. A fixed constant rather than a configuration property —
     *  the card ceremony has no other tunables yet; a future task can promote this if needed. */
    static final Duration CEREMONY_TTL = Duration.ofMinutes(30);

    /** States {@link #lazilyExpireIfNeeded} must never touch: {@code FAILED}/{@code EXPIRED} are
     *  already terminal, and {@code ATTEST_ANCHORED} is this ceremony's success state (there is no
     *  separate "consumed" step in the card ceremony, unlike the platform's reference) — a completed
     *  ceremony must never be reclassified as expired just because A5/A6 hasn't read it back yet. */
    private static final Set<CardCeremonyState> TERMINAL_STATES =
            EnumSet.of(CardCeremonyState.ATTEST_ANCHORED, CardCeremonyState.FAILED, CardCeremonyState.EXPIRED);

    private final CardAttestationCeremonyRepository ceremonyRepository;

    /**
     * Creates a new ceremony for {@code cardId} in {@link CardCeremonyState#CREATED}, generation 0,
     * expiring {@link #CEREMONY_TTL} from now. No per-card uniqueness check: a caller may create more
     * than one ceremony for the same card (e.g. a retried/abandoned pairing attempt) — that policy
     * decision is left to the REST layer (A6), not this state machine.
     */
    public CardAttestationCeremonyEntity create(UUID cardId) {
        LocalDateTime now = LocalDateTime.now();
        CardAttestationCeremonyEntity ceremony = CardAttestationCeremonyEntity.builder()
                .id(UUID.randomUUID())
                .cardId(cardId)
                .state(CardCeremonyState.CREATED)
                .attemptGeneration(0)
                .expiresAt(now.plus(CEREMONY_TTL))
                .build();
        return ceremonyRepository.save(ceremony);
    }

    /**
     * Row-locked read. Applies the same lazy-expiry check as every other entry point so a caller
     * polling an overdue ceremony observes (and durably persists) {@code EXPIRED} rather than a stale
     * waiting state.
     */
    public Optional<CardAttestationCeremonyEntity> get(UUID ceremonyId) {
        Optional<CardAttestationCeremonyEntity> found = ceremonyRepository.findByIdForUpdate(ceremonyId);
        found.ifPresent(this::lazilyExpireIfNeeded);
        return found;
    }

    /**
     * Begins (or retries) a step. Non-retry requires the ceremony to be exactly in {@code
     * expectedState} and moves it to {@code waitingState}. Retry requires the ceremony to already be
     * in {@code waitingState} (only the step currently being waited on can be retried) and bumps
     * {@code attemptGeneration}, so a late completion/failure from the superseded attempt is
     * discarded by {@link #completeStep}/{@link #failStep}'s generation check.
     *
     * @throws CardCeremonyNotFoundException no ceremony exists with {@code ceremonyId}
     * @throws CardCeremonyExpiredException the ceremony's TTL has elapsed
     * @throws CardCeremonyInvalidStateException the ceremony isn't in the state this call expects
     */
    public CardAttestationCeremonyEntity beginStep(UUID ceremonyId, CardCeremonyState expectedState,
            CardCeremonyState waitingState, boolean retry) {
        CardAttestationCeremonyEntity ceremony = ceremonyRepository.findByIdForUpdate(ceremonyId)
                .orElseThrow(() -> notFound(ceremonyId));
        if (lazilyExpireIfNeeded(ceremony)) {
            throw expired(ceremonyId);
        }

        LocalDateTime now = LocalDateTime.now();
        if (retry) {
            if (ceremony.getState() != waitingState) {
                throw invalidState(ceremonyId, waitingState, ceremony.getState());
            }
            ceremony.setAttemptGeneration(ceremony.getAttemptGeneration() + 1);
        } else {
            if (ceremony.getState() != expectedState) {
                throw invalidState(ceremonyId, expectedState, ceremony.getState());
            }
            ceremony.setState(waitingState);
        }
        ceremony.setUpdatedAt(now);
        return ceremonyRepository.save(ceremony);
    }

    /**
     * CAS step completion: applies {@code mutator} and moves {@code from -> to} only if the ceremony
     * is still at generation {@code expectedGeneration} and state {@code from}. A superseded caller
     * (its step was retried, or the ceremony moved on for some other reason) silently no-ops instead
     * of corrupting newer state — there is no way to report failure back to it, by design.
     *
     * @return {@code true} if the CAS matched and the transition (and mutator) actually ran, {@code
     *         false} if this call was a stale no-op. Callers that do something AFTER a successful
     *         completion which must never happen for a discarded attempt — e.g. {@link
     *         KeriNotificationCorrelator#markAndDelete} — must gate that on this return value.
     */
    public boolean completeStep(UUID ceremonyId, int expectedGeneration, CardCeremonyState from,
            CardCeremonyState to, Consumer<CardAttestationCeremonyEntity> mutator) {
        Optional<CardAttestationCeremonyEntity> found = ceremonyRepository.findByIdForUpdate(ceremonyId);
        if (found.isEmpty()) {
            return false;
        }
        CardAttestationCeremonyEntity ceremony = found.get();
        if (ceremony.getAttemptGeneration() != expectedGeneration || ceremony.getState() != from) {
            return false;
        }
        mutator.accept(ceremony);
        ceremony.setState(to);
        ceremony.setUpdatedAt(LocalDateTime.now());
        ceremonyRepository.save(ceremony);
        return true;
    }

    /**
     * Guarded update of step-data fields (e.g. {@code requestExnSaid}, {@code kelFloorSequence}) on a
     * ceremony that is still waiting on the same step: row-locks the ceremony, verifies it is still at
     * generation {@code expectedGeneration} and state {@code expectedWaitingState}, applies {@code
     * mutator}, persists, and reports {@code true}. A mismatch (a concurrent retry bumped the
     * generation, or a concurrent completion/failure moved the ceremony out of {@code
     * expectedWaitingState}) leaves the row untouched and reports {@code false} — the same CAS
     * discipline as {@link #completeStep}/{@link #failStep}, just without a state transition of its
     * own.
     *
     * <p>{@code mutator} must only touch step-data fields (never {@code state} or {@code
     * attemptGeneration} — callers that need a transition use {@link #completeStep}/{@link
     * #failStep} instead).
     *
     * @return {@code true} if the guard matched and the mutator ran and was persisted, {@code false}
     *         if this call was a stale no-op.
     */
    public boolean updateWaitingStepData(UUID ceremonyId, int expectedGeneration,
            CardCeremonyState expectedWaitingState, Consumer<CardAttestationCeremonyEntity> mutator) {
        Optional<CardAttestationCeremonyEntity> found = ceremonyRepository.findByIdForUpdate(ceremonyId);
        if (found.isEmpty()) {
            return false;
        }
        CardAttestationCeremonyEntity ceremony = found.get();
        if (ceremony.getAttemptGeneration() != expectedGeneration || ceremony.getState() != expectedWaitingState) {
            return false;
        }
        mutator.accept(ceremony);
        ceremony.setUpdatedAt(LocalDateTime.now());
        ceremonyRepository.save(ceremony);
        return true;
    }

    /**
     * CAS step failure: same generation-and-state guard as {@link #completeStep} — the ceremony must
     * still be at generation {@code expectedGeneration} AND in {@code expectedWaitingState}, or this
     * silently no-ops. A generation-only check is not safe here: {@code attemptGeneration} only bumps
     * on retry, so a late failure signal for a step that already completed (generation unchanged)
     * would otherwise pass the CAS and clobber whatever later step the ceremony has since moved on to.
     */
    public void failStep(UUID ceremonyId, int expectedGeneration, CardCeremonyState expectedWaitingState,
            String errorTitle, String errorDetail) {
        Optional<CardAttestationCeremonyEntity> found = ceremonyRepository.findByIdForUpdate(ceremonyId);
        if (found.isEmpty()) {
            return;
        }
        CardAttestationCeremonyEntity ceremony = found.get();
        if (ceremony.getAttemptGeneration() != expectedGeneration || ceremony.getState() != expectedWaitingState) {
            return;
        }
        ceremony.setErrorTitle(errorTitle);
        ceremony.setErrorDetail(errorDetail);
        ceremony.setState(CardCeremonyState.FAILED);
        ceremony.setUpdatedAt(LocalDateTime.now());
        ceremonyRepository.save(ceremony);
    }

    // --- internals ---

    /** Returns {@code true} if the ceremony is (now, or already was) EXPIRED. Mutates and persists
     *  the transition the first time it is observed past due — expiry is lazy, like the reference. */
    private boolean lazilyExpireIfNeeded(CardAttestationCeremonyEntity ceremony) {
        if (TERMINAL_STATES.contains(ceremony.getState())) {
            return ceremony.getState() == CardCeremonyState.EXPIRED;
        }
        if (!ceremony.getExpiresAt().isAfter(LocalDateTime.now())) {
            ceremony.setState(CardCeremonyState.EXPIRED);
            ceremony.setUpdatedAt(LocalDateTime.now());
            ceremonyRepository.save(ceremony);
            return true;
        }
        return false;
    }

    private static CardCeremonyNotFoundException notFound(UUID ceremonyId) {
        return new CardCeremonyNotFoundException("Ceremony %s was not found.".formatted(ceremonyId));
    }

    private static CardCeremonyExpiredException expired(UUID ceremonyId) {
        return new CardCeremonyExpiredException("Ceremony %s has expired.".formatted(ceremonyId));
    }

    private static CardCeremonyInvalidStateException invalidState(UUID ceremonyId, CardCeremonyState expected,
            CardCeremonyState actual) {
        return new CardCeremonyInvalidStateException(
                "Ceremony %s expected state %s but was %s.".formatted(ceremonyId, expected, actual));
    }
}
