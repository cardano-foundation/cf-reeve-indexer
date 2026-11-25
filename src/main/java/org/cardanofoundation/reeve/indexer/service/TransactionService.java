package org.cardanofoundation.reeve.indexer.service;

import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

import com.opencsv.CSVWriter;

import org.cardanofoundation.reeve.indexer.model.entity.TransactionEntity;
import org.cardanofoundation.reeve.indexer.model.entity.TransactionItemEntity;
import org.cardanofoundation.reeve.indexer.model.repository.TransactionItemRepository;
import org.cardanofoundation.reeve.indexer.model.repository.TransactionRepository;
import org.cardanofoundation.reeve.indexer.model.request.TransactionsSearchRequest;
import org.cardanofoundation.reeve.indexer.model.view.ExtractionTransactionItemView;
import org.cardanofoundation.reeve.indexer.model.view.ExtractionTransactionView;
import org.cardanofoundation.reeve.indexer.model.view.TransactionFullView;
import org.cardanofoundation.reeve.indexer.model.view.TransactionView;
import org.cardanofoundation.reeve.indexer.util.CsvSanitizer;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionItemRepository transactionItemRepository;

    private static final Map<String, String> SORT_FIELD_MAPPING = new HashMap<>();

    static {
        SORT_FIELD_MAPPING.put("id", "i.id");
        SORT_FIELD_MAPPING.put("transactionInternalNumber", "i.transaction.internalNumber");
        SORT_FIELD_MAPPING.put("entryDate", "i.transaction.date");
        SORT_FIELD_MAPPING.put("transactionType", "i.transaction.type");
        SORT_FIELD_MAPPING.put("blockChainHash", "i.transaction.txHash");
        SORT_FIELD_MAPPING.put("amountLcy", "i.amountLcy");
        SORT_FIELD_MAPPING.put("amountFcy", "i.amountFcy");
        SORT_FIELD_MAPPING.put("fxRate", "i.fxRate");
        SORT_FIELD_MAPPING.put("costCenterCustomerCode", "i.costCenterCustCode");
        SORT_FIELD_MAPPING.put("costCenterName", "i.costCenterName");
        SORT_FIELD_MAPPING.put("projectCustomerCode", "i.projectCustCode");
        SORT_FIELD_MAPPING.put("projectName", "i.projectName");
        SORT_FIELD_MAPPING.put("accountEventCode", "i.eventCode");
        SORT_FIELD_MAPPING.put("accountEventName", "i.eventName");
        SORT_FIELD_MAPPING.put("documentNumber", "i.documentNumber");
        SORT_FIELD_MAPPING.put("documentCurrencyCustomerCode", "i.currency");
        SORT_FIELD_MAPPING.put("vatCustomerCode", "i.vatCustCode");
        SORT_FIELD_MAPPING.put("vatRate", "i.vatRate");
        SORT_FIELD_MAPPING.put("counterPartyType", "i.counterPartyType");
        SORT_FIELD_MAPPING.put("counterPartyCustCode", "i.counterPartyCustCode");
    }

    private static final int CSV_PAGE_SIZE = 1000;

    private static final String[] CSV_HEADER = {"Transaction Number",
            "Transaction Date",
            "Transaction Type",
            "Fx Rate",
            "AmountLCY",
            "AmountFCY",
            "Event code",
            "Event Name",
            "Project Code",
            "Project Name",
            "Document Name",
            "Currency",
            "VAT Rate",
            "VAT Code",
            "Cost Center Code",
            "Cost Center Name",
            "Counterparty Code",
            "Counterparty Type",
            "Blockchain Hash",
            "Block Time"};

    public Page<TransactionView> findAllTransactions(Pageable pageable) {
        Page<TransactionEntity> transactionPage = transactionRepository.findAll(pageable);
        // Map the entity page to a DTO page
        return transactionPage.map(TransactionView::fromEntity);
    }

    public Page<TransactionFullView> findTransactionsByDateRange(
        String organisationId,
        LocalDate dateFrom,
        LocalDate dateTo,
        Pageable pageable) {

        LocalDate fromDate = dateFrom != null ? dateFrom : LocalDate.of(1970, 1, 1);
        LocalDate toDate = dateTo != null ? dateTo : LocalDate.now();

        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by(pageable.getSort().stream()
                .map(order -> {
                    String mappedField = SORT_FIELD_MAPPING.getOrDefault(
                        order.getProperty().replace("transaction.", ""),
                        order.getProperty()
                    );
                    return new Sort.Order(order.getDirection(), mappedField);
                })
                .collect(Collectors.toList())
            )
        );

        Page<TransactionEntity> transactions = transactionRepository.findByDateRangeAndOrganisationId(
            organisationId, fromDate, toDate, sortedPageable
        );

        return transactions.map(TransactionFullView::fromEntity);
    }

    public ExtractionTransactionView findTransactionItems(String organisationId, Set<String> transactionInternalNumber, LocalDate dateFrom, LocalDate dateTo,
                                                          Set<String> events,
                                                          Set<String> currencies, Double minAmountLcy,
                                                          Double maxAmountLcy, Double minAmountFcy,
                                                          Double maxAmountFcy, Set<String> transactionHashes, Set<String> documentNumber, Set<String> type,
                                                          Set<String> vatCustCode,
                                                          Set<String> costCenterCustCode,
                                                          Set<String> projectCustCode,
                                                          Set<String> counterPartyType,
                                                          Set<String> counterPartyCustCode,
                                                          Pageable pageable) {
        // Create a new Pageable with the correct sort field mapping
        Pageable sortedPageable = PageRequest.of(
            pageable.getPageNumber(),
            pageable.getPageSize(),
            Sort.by(pageable.getSort().stream()
                .map(order -> {
                    String mappedField = SORT_FIELD_MAPPING.getOrDefault(order.getProperty(), order.getProperty());
                    return new Sort.Order(order.getDirection(), mappedField);
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
                minAmountLcy,
                maxAmountLcy,
                minAmountFcy,
                maxAmountFcy,
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

    public void downloadCsvTransactions(TransactionsSearchRequest request, OutputStream outputStream) {
        try (Writer writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8)) {
            CSVWriter csvWriter = new CSVWriter(writer);
            csvWriter.writeNext(CSV_HEADER, false);
            for (int page = 0; ; page++) {
                ExtractionTransactionView result = findTransactionItems(
                        request.getOrganisationId(), request.getTransactionInternalNumber(),
                        request.getDateFrom(), request.getDateTo(), request.getEvents(),
                        request.getCurrency(), request.getMinAmountLcy(), request.getMaxAmountLcy(),
                        request.getMinAmountFcy(), request.getMaxAmountFcy(),
                        request.getTransactionHashes(), request.getDocumentNumber(), request.getType(),
                        request.getVatCustCode(), request.getCostCenterCustCode(),
                        request.getProjectCustCode(), request.getCounterPartyType(),
                        request.getCounterPartyCustCode(),
                        PageRequest.of(page, CSV_PAGE_SIZE, Sort.by("id")));
                if (!Boolean.TRUE.equals(result.getSuccess())) {
                    break;
                }
                result.getTransactions().forEach(item -> csvWriter.writeNext(toCsvRow(item), false));
                if ((long) (page + 1) * CSV_PAGE_SIZE >= result.getTotal()) {
                    break;
                }
            }
            csvWriter.flush();
        } catch (Exception e) {
            log.error("Error while writing transactions to CSV for orgId {}: {}",
                    request.getOrganisationId(), e.getMessage(), e);
        }
    }

    private static String[] toCsvRow(ExtractionTransactionItemView item) {
        return new String[] {
            CsvSanitizer.sanitize(item.getTransactionInternalNumber()),
            item.getEntryDate() != null ? item.getEntryDate().toString() : "",
            CsvSanitizer.sanitize(item.getTransactionType()),
            CsvSanitizer.sanitize(item.getFxRate()),
            csvNumber(item.getAmountLcy()),
            csvNumber(item.getAmountFcy()),
            CsvSanitizer.sanitize(item.getAccountEventCode()),
            CsvSanitizer.sanitize(item.getAccountEventName()),
            CsvSanitizer.sanitize(item.getProjectCustomerCode()),
            CsvSanitizer.sanitize(item.getProjectName()),
            CsvSanitizer.sanitize(item.getDocumentNumber()),
            CsvSanitizer.sanitize(item.getDocumentCurrencyCustomerCode()),
            CsvSanitizer.sanitize(item.getVatRate()),
            CsvSanitizer.sanitize(item.getVatCustomerCode()),
            CsvSanitizer.sanitize(item.getCostCenterCustomerCode()),
            CsvSanitizer.sanitize(item.getCostCenterName()),
            CsvSanitizer.sanitize(item.getCounterPartyCustCode()),
            CsvSanitizer.sanitize(item.getCounterPartyType()),
            CsvSanitizer.sanitize(item.getBlockChainHash()),
            item.getBlockTime() != null ? Instant.ofEpochSecond(item.getBlockTime()).toString() : ""
        };
    }

    private static String csvNumber(BigDecimal value) {
        return value != null ? value.stripTrailingZeros().toPlainString() : "";
    }
}
