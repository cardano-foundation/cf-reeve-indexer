package org.cardanofoundation.reeve.indexer.model.domain.ceremony;

/**
 * A card-attestation ceremony's progress: the indexer's own KERI agent pairing with a Veridian
 * wallet, that wallet presenting a credential, then anchoring a CIP-170 ATTEST for the card being
 * attested.
 *
 * <p>Deliberately simple: there is no per-user identity link, no {@code AUTH_BEGIN} step, and no
 * {@code bindingVersion}/relink concept — one card, one ceremony, one wallet AID pairs, presents a
 * credential, and attests it directly.
 *
 * <pre>
 * CREATED -&gt; PAIRED -&gt; CREDENTIAL_RECEIVED -&gt; ATTEST_ANCHORED
 * any non-terminal state -&gt; FAILED | EXPIRED
 * </pre>
 */
public enum CardCeremonyState {
    CREATED,
    PAIRED,
    CREDENTIAL_RECEIVED,
    ATTEST_ANCHORED,
    FAILED,
    EXPIRED
}
