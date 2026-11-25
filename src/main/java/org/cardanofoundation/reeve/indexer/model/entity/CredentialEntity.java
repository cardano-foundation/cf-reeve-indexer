package org.cardanofoundation.reeve.indexer.model.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;


@Entity
@Table(name = "identity_credential")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CredentialEntity {

    @Id
    @Column(name = "prefix_id")
    private String prefixId; // last in prefix list

    @Column(name = "tx_hash")
    private String txHash;

    @Column(name = "credential_chain")
    private String credentialChain;

    @Type(JsonType.class)
    @Column(name = "metadata_labels", columnDefinition = "jsonb")
    private List<String> labels;

    @Column(name = "lei")
    private String lei;

    /** Schema SAID of the leaf credential (from label-170 AUTH_BEGIN {@code s}). */
    @Column(name = "schema_said")
    private String schemaSaid;

    /** JSON text of the credential's generic claim map ({@code m} minus the {@code l} labels key). */
    @Column(name = "claims")
    private String claims;

    @Column(name = "valid")
    private Boolean valid;

}
