package org.cardanofoundation.reeve.indexer.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Service;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionEntity;
import org.cardanofoundation.reeve.indexer.model.entity.TransactionItemEntity;
import org.cardanofoundation.reeve.indexer.model.repository.TransactionItemRepository;
import org.cardanofoundation.reeve.indexer.model.repository.TransactionRepository;
import org.cardanofoundation.reeve.indexer.model.view.ExtractionTransactionItemView;
import org.cardanofoundation.reeve.indexer.model.view.ExtractionTransactionView;
import org.cardanofoundation.reeve.indexer.model.view.TransactionView;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionItemRepository transactionItemRepository;

    public Page<TransactionView> findAllTransactions(Pageable pageable) {
        Page<TransactionEntity> transactionPage = transactionRepository.findAll(pageable);
        // Map the entity page to a DTO page
        return transactionPage.map(TransactionView::fromEntity);
    }

    public ExtractionTransactionView findTransactionItems(String organisationId, String transactionInternalNumber, LocalDate dateFrom, LocalDate dateTo,
                                                          Set<String> events,
                                                          Set<String> currencies, Double minAmount,
                                                          Double maxAmount, Set<String> transactionHashes, Set<String> documentNumber, Set<String> type,
                                                          Set<String> vatCustCode,
                                                          Set<String> costCenterCustCode,
                                                          Set<String> projectCustCode,
                                                          Set<String> counterPartyType,
                                                          Set<String> counterPartyCustCode,
                                                          Pageable pageable) {
        // Create a new Pageable with the correct sort field
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by(pageable.getSort().stream()
                .map(order -> {
                    if ("entryDate".equals(order.getProperty())) {
                        return new Sort.Order(order.getDirection(), "transaction.date");
                    }
                    return order;
                })
                .collect(Collectors.toList())
            )
        );

        Page<TransactionItemEntity> transactionItems;
        try {
            transactionItems = transactionItemRepository.searchItems(
                organisationId,
                transactionInternalNumber,
                Optional.ofNullable(dateFrom).orElse(LocalDate.of(1970, 1, 1)).atStartOfDay(),
                Optional.ofNullable(dateTo).orElse(LocalDate.now()).atStartOfDay(),
                events,
                currencies,
                minAmount,
                maxAmount,
                transactionHashes,
                documentNumber,
                type,
                vatCustCode,
                costCenterCustCode,
                projectCustCode,
                counterPartyType,
                counterPartyCustCode,
                sortedPageable
            );
        } catch (Exception e) {
            log.error("Error occurred while searching transaction items", e);
            return ExtractionTransactionView.createFail(ProblemDetail.forStatusAndDetail(
                HttpStatusCode.valueOf(400),
                "Error occurred while searching transaction items: " + e.getMessage()
            ));
        }
        List<ExtractionTransactionItemView> itemViews = transactionItems.stream()
                .map(ExtractionTransactionItemView::fromEntity).toList();
        return ExtractionTransactionView.createSuccess(itemViews, transactionItems.getTotalElements(),
                pageable.getPageNumber(), pageable.getPageSize());
    }
}
