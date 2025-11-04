package org.cardanofoundation.reeve.indexer.model.entity.mapper;

import java.util.ArrayList;
import java.util.List;

import org.cardanofoundation.reeve.indexer.model.domain.metadata.IdentityMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity.CredentialEntityBuilder;

public final class CredentialMetadataMapper {

    private CredentialMetadataMapper() {}

    @SuppressWarnings("unchecked")
    public static CredentialEntity toEntity(IdentityMetadata domain) {
        CredentialEntityBuilder builder = CredentialEntity.builder();

        if(domain.getM() != null) {
            if(domain.getM().containsKey("l")) {
                List<String> labels = new ArrayList<>();
                labels.addAll((List<String>) domain.getM().get("l"));
                builder.labels(labels.isEmpty() ? null : labels);
            }
            if(domain.getM().containsKey("LEI")) {
                builder.lei((String) domain.getM().get("LEI"));
            }
        }

        builder.prefixId(domain.getI())
                .txHash(domain.getTxHash())
                .credentialChain(domain.getC())
                .valid(true); // TODO check if credentialChain is valid



        return builder.build();
    }
}
