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

    /**
     * Hard cap on a single IPFS envelope fetch. Shared by the read proxy ({@link
     * org.cardanofoundation.reeve.indexer.service.DocumentService}) and the verification scheduler
     * ({@code DocumentEnvelopeVerifier}) so both agree on what is too large to process — a mismatch
     * would let one path accept an envelope the other cannot, and an uncapped fetch lets a hostile
     * anchor point {@code ipfs_cid} at arbitrarily large content to exhaust the verifier's heap.
     */
    public static final long MAX_ENVELOPE_BYTES = 15L * 1024 * 1024;

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

    /** Fetches raw bytes with a hard size cap; empty on failure or when the cap is exceeded. */
    public Optional<byte[]> fetchBytes(String cidOrUri, long maxBytes) {
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
            HttpResponse<java.io.InputStream> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            // Close the body regardless of status code — an unread stream on a non-200 response
            // otherwise leaks the underlying connection.
            try (java.io.InputStream in = response.body()) {
                if (response.statusCode() != 200) {
                    log.error("Failed to fetch IPFS content {}: HTTP {}", cid,
                            response.statusCode());
                    return Optional.empty();
                }
                byte[] bytes = in.readNBytes((int) Math.min(maxBytes + 1, Integer.MAX_VALUE));
                if (bytes.length > maxBytes) {
                    log.error("IPFS content {} exceeds cap of {} bytes", cid, maxBytes);
                    return Optional.empty();
                }
                return Optional.of(bytes);
            }
        } catch (Exception e) {
            log.error("Failed to fetch IPFS content {}: {}", cid, e.getMessage());
            return Optional.empty();
        }
    }
}
