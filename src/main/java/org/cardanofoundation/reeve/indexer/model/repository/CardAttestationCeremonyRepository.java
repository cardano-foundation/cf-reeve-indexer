package org.cardanofoundation.reeve.indexer.model.repository;

import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.cardanofoundation.reeve.indexer.model.entity.CardAttestationCeremonyEntity;

public interface CardAttestationCeremonyRepository extends JpaRepository<CardAttestationCeremonyEntity, UUID> {

    /**
     * Row-level {@code SELECT ... FOR UPDATE}. Every step transition CASes on {@code (state,
     * attemptGeneration)} ({@code CardCeremonyService}) — this lock serializes a retry bumping the
     * generation against a concurrent completion/failure reading and applying the pre-bump state,
     * ported from the platform's {@code keri_attestation} module's {@code
     * KeriAttestationCeremonyRepository#findByIdForUpdate}.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CardAttestationCeremonyEntity c where c.id = :id")
    Optional<CardAttestationCeremonyEntity> findByIdForUpdate(@Param("id") UUID id);
}
