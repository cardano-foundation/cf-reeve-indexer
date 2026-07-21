package org.cardanofoundation.reeve.indexer.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;
import org.cardanofoundation.reeve.indexer.model.view.cards.CardViews;
import org.cardanofoundation.reeve.indexer.service.cards.CardIssuanceService;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
@Tag(name = "Key cards", description = "Assemble and re-export UNSIGNED REEVE_KEY_CARDs (§9.4). Import is permissionless; the operator endpoint stays behind HTTP Basic.")
public class CardController {

    private final CardIssuanceService cardIssuanceService;

    @Operation(summary = "Whether this deployment can issue cards (public probe)")
    @GetMapping("/status")
    public ResponseEntity<CardViews.StatusView> status() {
        return ResponseEntity.ok(new CardViews.StatusView(cardIssuanceService.isEnabled()));
    }

    @Operation(summary = "Assemble a card's PUBLIC part unsigned (the private key never reaches this API)")
    @PostMapping("/issue")
    public ResponseEntity<?> issue(@RequestBody JsonNode request) {
        try {
            return ResponseEntity.ok(cardIssuanceService.issue(request));
        } catch (CardIssuanceService.CardIssuanceException e) {
            return problem(e);
        }
    }

    @Operation(summary = "Registry of issued cards - public parts only")
    @GetMapping
    public ResponseEntity<CardViews.RegistryResponse> registry(
            @RequestParam(required = false) String orgId,
            @RequestParam(required = false) String subjectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<IssuedCardEntity> result = cardIssuanceService.registry(orgId, subjectId, page, size);
        List<CardViews.RegistryEntryView> content = result.getContent().stream()
                .map(CardViews.RegistryEntryView::from).toList();
        return ResponseEntity.ok(new CardViews.RegistryResponse(content,
                result.getTotalElements(), result.getTotalPages(), result.getNumber(),
                result.getSize()));
    }

    @Operation(summary = "Re-export a registry entry as a contact card")
    @GetMapping("/{cardId}/export")
    public ResponseEntity<?> export(@PathVariable UUID cardId) {
        try {
            Optional<JsonNode> card = cardIssuanceService.exportCard(cardId);
            if (card.isEmpty()) {
                ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
                problem.setTitle("CARD_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
            }
            return ResponseEntity.ok(card.get());
        } catch (CardIssuanceService.CardIssuanceException e) {
            return problem(e);
        }
    }

    private ResponseEntity<ProblemDetail> problem(CardIssuanceService.CardIssuanceException e) {
        ProblemDetail problem = ProblemDetail.forStatus(e.getStatus());
        problem.setTitle(e.getTitle());
        problem.setDetail(e.getMessage());
        return ResponseEntity.status(e.getStatus()).body(problem);
    }
}
