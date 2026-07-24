package org.cardanofoundation.reeve.indexer.controller;

import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.cardanofoundation.reeve.indexer.model.domain.ceremony.CardCeremonyState;
import org.cardanofoundation.reeve.indexer.model.entity.CardAttestationCeremonyEntity;
import org.cardanofoundation.reeve.indexer.model.entity.IssuedCardEntity;
import org.cardanofoundation.reeve.indexer.model.request.CardCeremonyCreateRequest;
import org.cardanofoundation.reeve.indexer.model.request.CardCeremonyPairRequest;
import org.cardanofoundation.reeve.indexer.model.request.CardCeremonyStepRequest;
import org.cardanofoundation.reeve.indexer.model.view.cards.CardCeremonyView;
import org.cardanofoundation.reeve.indexer.service.CardAttestService;
import org.cardanofoundation.reeve.indexer.service.CardAttestationOobiService;
import org.cardanofoundation.reeve.indexer.service.CardCeremonyNotFoundException;
import org.cardanofoundation.reeve.indexer.service.CardCeremonyService;
import org.cardanofoundation.reeve.indexer.service.CardCredentialService;
import org.cardanofoundation.reeve.indexer.service.cards.CardIssuanceService;

/**
 * REST surface for the card-attestation ceremony (design doc Part A / A6): register a client-built
 * card and open a ceremony for it (Option B — the browser assembles the card entirely client-side,
 * so there is no server {@code cardId} to reference), then drive it synchronously through pair -&gt;
 * present-credential -&gt; attest, one blocking POST per step, so a frontend wizard can await each
 * response and render the next screen. Mirrors the platform's ({@code cf-reeve-platform}) {@code keri_attestation} module's own
 * {@code KeriAttestationController} for THIS convention specifically (this app has no {@code vavr}/
 * {@code Either} plumbing though, see {@link CardAttestationExceptionHandler} for the equivalent as a
 * scoped {@code @RestControllerAdvice} instead of that module's per-call {@code Responses.respond}):
 *
 * <p><b>A "failed step" is a 200, not an HTTP error.</b> {@link CardCredentialService#pair}, {@link
 * CardCredentialService#presentCredential}, and {@link CardAttestService#attest} all fold a
 * step-level failure (a rejected/timed-out/malformed wallet interaction, a tx-submission error, ...)
 * into {@code CardCeremonyState.FAILED} plus {@code errorTitle}/{@code errorDetail} on the ceremony
 * ENTITY, per each service's own isolation-contract javadoc — they never throw for that case. This
 * controller does nothing special to preserve that: it just returns whatever state the service call
 * left the ceremony in. Only a caller-side usage problem — an unknown/expired/wrong-state ceremony
 * (from {@link CardCeremonyService}), a malformed OOBI, or a transiently unreachable KERI agent —
 * produces a non-2xx response, via {@link CardAttestationExceptionHandler}.
 *
 * <p><b>SECURITY (deliberate choice, matching the card-issuance flow's own posture):</b> every
 * endpoint here is PUBLIC (no auth), UNLIKE the operator-gated {@code /api/v1/cards/issue}/{@code
 * /export}/{@code registry} (HTTP Basic, see {@code SecurityConfig}). The card-issuance frontend
 * this wizard extends is itself unauthenticated and fully client-side (see {@code
 * ViewCardIssuance.component.tsx}'s own comment: "there is no login and no network call to create a
 * card" — its only existing network call is the public {@code /status} probe) and has no operator
 * credentials to attach to a request; gating these ceremony endpoints the same way {@code /issue}
 * is gated would make the wizard undrivable from that frontend. {@code SecurityConfig} carries a
 * matching {@code permitAll} rule for exactly this controller's paths — see that class for the
 * reasoning in one place.
 */
@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Card attestation ceremony",
        description = "Pair a Veridian wallet, present a credential, and attest an already-issued "
                + "card, synchronously (design doc Part A / A6). Public — no operator auth, matching "
                + "the card-issuance frontend's own unauthenticated posture.")
public class CardAttestationController {

    private final CardCeremonyService ceremonyService;
    private final CardCredentialService credentialService;
    private final CardAttestService attestService;
    private final CardAttestationOobiService oobiService;
    private final CardIssuanceService cardIssuanceService;

    @Operation(summary = "Register a card and open an attestation ceremony for it",
            description = "Takes the full client-built REEVE_KEY_CARD (the browser assembles it "
                    + "entirely client-side, so it has no server cardId yet): registers it in the "
                    + "issued-card registry — same validation as the operator /issue path — then opens "
                    + "a ceremony against the new cardId. 400 if the card is malformed or carries "
                    + "private-key material. The response's agentOobi lets the wizard render the "
                    + "pairing QR immediately.")
    @PostMapping("/attestation/ceremonies")
    public ResponseEntity<?> create(@RequestBody(required = false) CardCeremonyCreateRequest request) {
        JsonNode card = request == null ? null : request.getCard();
        IssuedCardEntity registered;
        try {
            registered = cardIssuanceService.issueEntityFromCard(card);
        } catch (CardIssuanceService.CardIssuanceException e) {
            return cardRejected(e);
        }
        CardAttestationCeremonyEntity ceremony = ceremonyService.create(registered.getCardId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toView(ceremony));
    }

    @Operation(summary = "Pair the ceremony with a Veridian wallet OOBI",
            description = "Blocks synchronously. A pairing failure comes back as 200 with "
                    + "state=FAILED, not an HTTP error - see this controller's own javadoc.")
    @PostMapping("/attestation/ceremonies/{id}/pair")
    public ResponseEntity<CardCeremonyView> pair(@PathVariable UUID id,
            @RequestBody CardCeremonyPairRequest request) {
        String walletOobiUrl = request == null ? null : request.getWalletOobiUrl();
        CardAttestationCeremonyEntity ceremony = credentialService.pair(id, walletOobiUrl);
        return ResponseEntity.ok(toView(ceremony));
    }

    @Operation(summary = "Present (or retry presenting) the wallet's credential",
            description = "Blocks synchronously on the wallet's IPEX reply. A presentation failure "
                    + "comes back as 200 with state=FAILED, not an HTTP error.")
    @PostMapping("/attestation/ceremonies/{id}/present-credential")
    public ResponseEntity<CardCeremonyView> presentCredential(@PathVariable UUID id,
            @RequestBody(required = false) CardCeremonyStepRequest request) {
        boolean retry = request != null && request.isRetry();
        CardAttestationCeremonyEntity ceremony = credentialService.presentCredential(id, retry);
        return ResponseEntity.ok(toView(ceremony));
    }

    @Operation(summary = "Attest (or retry attesting) the card, anchoring it on-chain",
            description = "Blocks synchronously on the wallet's remotesign reply and the on-chain "
                    + "submission. An attest failure comes back as 200 with state=FAILED (or, if only "
                    + "the tx submission failed, state stays CREDENTIAL_RECEIVED so a retry resumes "
                    + "just the submission) — never an HTTP error.")
    @PostMapping("/attestation/ceremonies/{id}/attest")
    public ResponseEntity<CardCeremonyView> attest(@PathVariable UUID id,
            @RequestBody(required = false) CardCeremonyStepRequest request) {
        boolean retry = request != null && request.isRetry();
        CardAttestationCeremonyEntity ceremony = attestService.attest(id, retry);
        return ResponseEntity.ok(toView(ceremony));
    }

    @Operation(summary = "Fetch a ceremony's current state", description = "For the wizard's polling "
            + "loop while a step is in flight elsewhere, or to resume after a page reload.")
    @GetMapping("/attestation/ceremonies/{id}")
    public ResponseEntity<CardCeremonyView> get(@PathVariable UUID id) {
        CardAttestationCeremonyEntity ceremony = ceremonyService.get(id)
                .orElseThrow(() -> new CardCeremonyNotFoundException(
                        "Ceremony %s was not found.".formatted(id)));
        return ResponseEntity.ok(toView(ceremony));
    }

    // --- internals ---

    private CardCeremonyView toView(CardAttestationCeremonyEntity ceremony) {
        return CardCeremonyView.of(ceremony, resolveAgentOobiOrNull(), exportedCardIfAnchored(ceremony));
    }

    /**
     * The now-attested card, so the public wizard (which has no operator credentials for the gated
     * {@code /{cardId}/export}) can hand the holder the card to import into the platform — but ONLY
     * once {@link CardCeremonyState#ATTEST_ANCHORED}, when the {@code attestation} block has been
     * bound. {@code null} at every earlier state, and best-effort: a missing/failed export never turns
     * an otherwise-successful ceremony response into a 500.
     */
    private JsonNode exportedCardIfAnchored(CardAttestationCeremonyEntity ceremony) {
        if (ceremony.getState() != CardCeremonyState.ATTEST_ANCHORED) {
            return null;
        }
        try {
            return cardIssuanceService.exportCard(ceremony.getCardId()).orElse(null);
        } catch (RuntimeException e) {
            log.warn("Failed to export the attested card {} for ceremony {} (the wizard can re-poll): {}",
                    ceremony.getCardId(), ceremony.getId(), e.getMessage());
            return null;
        }
    }

    /**
     * Best-effort: {@link CardAttestationOobiService#getAgentOobi()} is a cached, O(1) field read
     * once KERI has bootstrapped, but a transient bootstrap gap or {@code keri.enabled=false} must
     * never turn an otherwise-successful ceremony response into a 500 - the wizard can always re-poll
     * {@link #get} for the QR once the agent settles.
     */
    private String resolveAgentOobiOrNull() {
        try {
            return oobiService.getAgentOobi();
        } catch (RuntimeException e) {
            log.warn("Agent OOBI unavailable while building a ceremony view: {}", e.getMessage());
            return null;
        }
    }

    /** Maps a card-registration rejection (malformed card, smuggled private-key material, issuance
     *  disabled) onto its ProblemDetail — same shape {@code CardController} uses for {@code /issue}. */
    private ResponseEntity<Object> cardRejected(CardIssuanceService.CardIssuanceException e) {
        ProblemDetail problem = ProblemDetail.forStatus(e.getStatus());
        problem.setTitle(e.getTitle());
        problem.setDetail(e.getMessage());
        return ResponseEntity.status(e.getStatus()).body(problem);
    }
}
