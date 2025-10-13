package org.cardanofoundation.reeve.indexer.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.cardanofoundation.reeve.indexer.model.entity.IdentityEventEntity;

public interface IdentityEventRepository extends JpaRepository<IdentityEventEntity, String> {

}
