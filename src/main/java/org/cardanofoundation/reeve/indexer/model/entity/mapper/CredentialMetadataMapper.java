package org.cardanofoundation.reeve.indexer.model.entity.mapper;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.cardanofoundation.reeve.indexer.model.domain.metadata.IdentityMetadata;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity;
import org.cardanofoundation.reeve.indexer.model.entity.CredentialEntity.CredentialEntityBuilder;

@Slf4j
public final class CredentialMetadataMapper {

    private CredentialMetadataMapper() {}

    /**
     * Maps a label-170 {@code AUTH_BEGIN} {@link IdentityMetadata} to a {@link CredentialEntity}.
     *
     * <p>For {@code AUTH_BEGIN}, the top-level {@code s} field carries the leaf credential's
     * <b>schema SAID</b> (not a KEL sequence number — that overload of {@code s} only applies to
     * {@code ATTEST} events; see {@code Cip170MetadataFactory#authBeginMap}). {@code m} carries
     * {@code {l: [authorized labels], ...optional claims}}; everything in {@code m} except the
     * reserved {@code l} key is stored verbatim as {@code claims}, and {@code lei} is derived from
     * {@code claims["LEI"]} when present, kept only for backward compatibility.
     */
    @SuppressWarnings("unchecked")
    public static CredentialEntity toEntity(IdentityMetadata domain, ObjectMapper objectMapper) {
        CredentialEntityBuilder builder = CredentialEntity.builder();

        if (domain.getM() != null) {
            Map<String, Object> m = domain.getM();

            if (m.containsKey("l")) {
                List<String> labels = new ArrayList<>();
                labels.addAll((List<String>) m.get("l"));
                builder.labels(labels.isEmpty() ? null : labels);
            }

            Map<String, Object> claimsMap = new LinkedHashMap<>(m);
            claimsMap.remove("l");
            if (!claimsMap.isEmpty()) {
                if (claimsMap.get("LEI") instanceof String lei) {
                    builder.lei(lei);
                }
                try {
                    builder.claims(objectMapper.writeValueAsString(claimsMap));
                } catch (JsonProcessingException e) {
                    log.error("Can't serialize claims for prefixId: {}, error: {}",
                            domain.getI(), e.getMessage());
                }
            }
        }

        builder.prefixId(domain.getI())
                .txHash(domain.getTxHash())
                .credentialChain(domain.getC())
                // AUTH_BEGIN overload of `s`: leaf credential schema SAID (see Cip170MetadataFactory).
                .schemaSaid(domain.getS())
                .valid(true); // TODO check if credentialChain is valid

        return builder.build();
    }
}
