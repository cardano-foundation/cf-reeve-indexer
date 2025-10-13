package org.cardanofoundation.reeve.indexer.model.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.cardanofoundation.reeve.indexer.model.domain.metadata.EventAndAttachments;
import org.cardanofoundation.reeve.indexer.model.entity.converter.EventAndAttachmentsConverter;
import org.cardanofoundation.reeve.indexer.model.entity.converter.MapListConverter;
import org.cardanofoundation.reeve.indexer.model.entity.converter.StringListConverter;

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

    @Column(name = "prefixes", columnDefinition = "text")
    @Convert(converter = StringListConverter.class)
    private List<String> prefixes;

    @Column(name = "tx_hash")
    private String txHash;

    @Column(name = "identity_type")
    private String type;

    @Column(name = "vcp", columnDefinition = "text")
    @Convert(converter = EventAndAttachmentsConverter.class)
    private EventAndAttachments vcp;

    @Column(name = "iss", columnDefinition = "text")
    @Convert(converter = EventAndAttachmentsConverter.class)
    private EventAndAttachments iss;

    @Column(name = "acdc", columnDefinition = "text")
    @Convert(converter = MapListConverter.class)
    private List<java.util.Map<String, Object>> acdc;

}
