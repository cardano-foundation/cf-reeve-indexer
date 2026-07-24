package org.cardanofoundation.reeve.indexer.service;

/**
 * Internal-only signal used by {@link CardCredentialService} to unify every failure branch of a
 * ceremony step (a failed IPEX send, a wallet timeout, a rejected credential, an unexpected
 * collaborator exception, ...) into one thing that gets caught ONCE, at the top of the step's public
 * method, and turned into a {@code CardCeremonyService#failStep} call. It is deliberately unchecked
 * (no {@code vavr}, per this app's convention — see {@code CardCeremonyService}'s own javadoc) but is
 * never expected to escape {@link CardCredentialService}'s own boundary: every public method there
 * ({@code pair}, {@code presentCredential}) catches it (and any other {@link RuntimeException}) and
 * always returns the ceremony's current (by then durably FAILED) state rather than propagating —
 * "isolate exceptions, no propagation past the ceremony" (design doc Part A / A4).
 */
class CardCredentialStepException extends RuntimeException {

    private final String title;

    CardCredentialStepException(String title, String detail) {
        super(detail);
        this.title = title;
    }

    CardCredentialStepException(String title, String detail, Throwable cause) {
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
