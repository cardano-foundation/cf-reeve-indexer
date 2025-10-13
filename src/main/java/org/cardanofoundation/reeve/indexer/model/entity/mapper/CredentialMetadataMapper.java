package org.cardanofoundation.reeve.indexer.model.entity.mapper;

import java.util.List;

import org.cardanofoundation.reeve.indexer.model.domain.metadata.IdentityMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity.CredentialEntityBuilder;

public final class CredentialMetadataMapper {

    private CredentialMetadataMapper() {}

    public static CredentialEntity toEntity(IdentityMetadata domain) {
        CredentialEntityBuilder builder = CredentialEntity.builder();

        List<String> prefixes = domain.getPrefix();
        String prefixId = null;
        if (prefixes != null && !prefixes.isEmpty()) {
            prefixId = prefixes.get(prefixes.size() - 1);
        }

        builder.prefixId(prefixId)
                .prefixes(prefixes)
                .txHash(domain.getTxHash())
                .type(domain.getType() == null ? null : domain.getType().name())
                .vcp(domain.getVcp())
                .iss(domain.getIss())
                .acdc(domain.getAcdc());

        return builder.build();
    }
}
