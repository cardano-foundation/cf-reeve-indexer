package org.cardanofoundation.reeve.indexer.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.cardanofoundation.reeve.indexer.model.entity.ExcludedTransactionEntity;

public interface ExcludedTransactionRepository extends JpaRepository<ExcludedTransactionEntity, String> {
}
