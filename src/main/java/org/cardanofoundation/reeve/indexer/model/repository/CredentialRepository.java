package org.cardanofoundation.reeve.indexer.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity;

public interface CredentialRepository extends JpaRepository<CredentialEntity, String> {

}
