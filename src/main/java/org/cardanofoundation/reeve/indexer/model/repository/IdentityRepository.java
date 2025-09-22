package org.cardanofoundation.reeve.indexer.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.cardanofoundation.reeve.indexer.model.entity.IdentityEntity;

public interface IdentityRepository extends JpaRepository<IdentityEntity, String> {

}
