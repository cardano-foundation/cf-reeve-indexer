package org.cardanofoundation.reeve.indexer.processor;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Small reusable client that resolves IPFS content through the configured gateway. Accepts either a
 * bare CID or an {@code ipfs://} URI.
 */
@Component
@Slf4j
public class IpfsGatewayClient {

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(10);

    @Value("${ipfs.gateway:https://ipfs.io/ipfs/}")
    private String ipfsGateway;

    @Value("${ipfs.timeout-seconds:15}")
    private long requestTimeoutSeconds;

    // Bounded so a stalled/unresponsive gateway cannot hang the (transactional) indexing thread.
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(CONNECT_TIMEOUT)
            .build();

    /** Fetches the document body for the given CID/URI, or empty if it cannot be retrieved. */
    public Optional<String> fetch(String cidOrUri) {
        if (cidOrUri == null || cidOrUri.isBlank()) {
            return Optional.empty();
        }
        String cid = cidOrUri.replace("ipfs://", "");
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ipfsGateway + cid))
                    .timeout(Duration.ofSeconds(requestTimeoutSeconds))
                    .GET()
                    .build();
            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                return Optional.of(response.body());
            }
            log.error("Failed to fetch IPFS content {}: HTTP {}", cid, response.statusCode());
            return Optional.empty();
        } catch (Exception e) {
            log.error("Failed to fetch IPFS content {}: {}", cid, e.getMessage());
            return Optional.empty();
        }
    }
}
