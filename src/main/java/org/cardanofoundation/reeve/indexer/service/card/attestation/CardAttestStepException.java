package org.cardanofoundation.reeve.indexer.service.card.attestation;

/**
 * Internal-only signal used by {@link CardAttestService} to unify every failure branch of the ATTEST
 * step (a failed remotesign send, a wallet timeout, an anchor that doesn't verify, a tx-submission
 * failure, an unexpected collaborator exception, ...) into one thing that gets caught ONCE, at the top
 * of {@link CardAttestService#attest}, and turned into a {@code CardCeremonyService#failStep} call.
 * Mirrors {@link CardCredentialStepException} exactly (same rationale — see that class's own
 * javadoc): deliberately unchecked (no {@code vavr}), never expected to escape {@link
 * CardAttestService}'s own boundary.
 */
class CardAttestStepException extends RuntimeException {

    private final String title;

    CardAttestStepException(String title, String detail) {
        super(detail);
        this.title = title;
    }

    CardAttestStepException(String title, String detail, Throwable cause) {
        super(detail, cause);
        this.title = title;
    }

    String title() {
        return title;
    }

    String detail() {
        return getMessage();
    }
}
