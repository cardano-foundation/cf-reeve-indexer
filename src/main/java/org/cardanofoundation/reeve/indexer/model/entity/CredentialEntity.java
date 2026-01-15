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

    @Column(name = "valid")
    private Boolean valid;

}
