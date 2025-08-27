package org.cardanofoundation.reeve.indexer.model.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionEntity;

public interface TransactionRepository extends JpaRepository<TransactionEntity, String> {


}
