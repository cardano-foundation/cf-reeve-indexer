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

    // EXTERNAL holders have no stable id other than their (deterministic, passkey-derived) public
    // key, so re-issuance is idempotent on (subjectType, organisationId, publicKey) — the minted
    // subjectId is NOT part of the key. findFirst tolerates any pre-existing duplicates gracefully.
    Optional<IssuedCardEntity> findFirstBySubjectTypeAndOrganisationIdAndPublicKey(String subjectType,
            String organisationId, String publicKey);
}
