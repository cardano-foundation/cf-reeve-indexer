package org.cardanofoundation.reeve.indexer.processor;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Small reusable client that resolves IPFS content through the configured gateways. Accepts either a
 * bare CID or an {@code ipfs://} URI.
 *
 * <p>{@code ipfs.gateway} is a comma-separated list, tried in order until one returns the content. A
 * gateway answering 429 or 503 is throttling us, not reporting the content missing; when EVERY gateway
 * does that, the fetch throws {@link IpfsRateLimitedException} so callers can leave their retry
 * budget untouched. Any other failure (404, timeout, refused connection, over-cap body) on at least one
 * gateway keeps the plain empty result.
 */
@Component
@Slf4j
public class IpfsGatewayClient {

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(30);

    /**
     * Hard cap on a single IPFS envelope fetch. Shared by the read proxy ({@link
     * org.cardanofoundation.reeve.indexer.service.document.DocumentService}) and the verification scheduler
     * ({@code DocumentEnvelopeVerifier}) so both agree on what is too large to process — a mismatch
     * would let one path accept an envelope the other cannot, and an uncapped fetch lets a hostile
     * anchor point {@code ipfs_cid} at arbitrarily large content to exhaust the verifier's heap.
     */
    public static final long MAX_ENVELOPE_BYTES = 15L * 1024 * 1024;

    // ipfs.io / dweb.link now answer path requests with 429 ("switching to a service worker gateway
    // only"), so free open gateways that still serve content go first and ipfs.io stays as a last resort.
    @Value("${ipfs.gateway:https://ipfs.filebase.io/ipfs/,https://gateway.pinata.cloud/ipfs/,https://ipfs.io/ipfs/}")
    private String ipfsGateway;

    @Value("${ipfs.timeout-seconds:30}")
    private long requestTimeoutSeconds;

    // Bounded so a stalled/unresponsive gateway cannot hang the (transactional) indexing thread.
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(CONNECT_TIMEOUT)
            .build();

    /** Every configured gateway refused with 429/503: nothing is known about the content itself. */
    public static class IpfsRateLimitedException extends RuntimeException {
        public IpfsRateLimitedException(String cid) {
            super("Every IPFS gateway rate-limited the request for " + cid);
        }
    }

    /**
     * Fetches the document body for the given CID/URI, or empty if it cannot be retrieved — including
     * when every gateway rate-limits it (callers of this path keep their existing empty-on-failure contract).
     */
    public Optional<String> fetch(String cidOrUri) {
        try {
            return fetchBytes(cidOrUri, Integer.MAX_VALUE - 1L).map(String::new);
        } catch (IpfsRateLimitedException e) {
            log.error("Failed to fetch IPFS content {}: {}", cidOrUri, e.getMessage());
            return Optional.empty();
        }
    }

    /** Fetches raw bytes with a hard size cap; empty on failure or when the cap is exceeded. */
    public Optional<byte[]> fetchBytes(String cidOrUri, long maxBytes) {
        if (cidOrUri == null || cidOrUri.isBlank()) {
            return Optional.empty();
        }
        String cid = cidOrUri.replace("ipfs://", "");
        boolean onlyRateLimited = true;
        for (String gateway : gateways()) {
            Attempt attempt = fetchFrom(gateway, cid, maxBytes);
            if (attempt.body() != null) {
                return Optional.of(attempt.body());
            }
            onlyRateLimited &= attempt.rateLimited();
        }
        if (onlyRateLimited) {
            throw new IpfsRateLimitedException(cid);
        }
        return Optional.empty();
    }

    private List<String> gateways() {
        return Arrays.stream(ipfsGateway.split(","))
                .map(String::trim)
                .filter(gateway -> !gateway.isEmpty())
                .map(gateway -> gateway.endsWith("/") ? gateway : gateway + "/")
                .toList();
    }

    /** One gateway's answer: the body on success, otherwise whether it was a 429/503 refusal. */
    private record Attempt(byte[] body, boolean rateLimited) {
    }

    private Attempt fetchFrom(String gateway, String cid, long maxBytes) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(gateway + cid))
                    .timeout(Duration.ofSeconds(requestTimeoutSeconds))
                    .GET()
                    .build();
            HttpResponse<InputStream> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            // Close the body regardless of status code — an unread stream on a non-200 response
            // otherwise leaks the underlying connection.
            try (InputStream in = response.body()) {
                int status = response.statusCode();
                if (status == 429 || status == 503) {
                    log.warn("IPFS gateway {} rate-limited {} (HTTP {})", gateway, cid, status);
                    return new Attempt(null, true);
                }
                if (status != 200) {
                    log.error("Failed to fetch IPFS content {} from {}: HTTP {}", cid, gateway, status);
                    return new Attempt(null, false);
                }
                byte[] bytes = in.readNBytes((int) Math.min(maxBytes + 1, Integer.MAX_VALUE));
                if (bytes.length > maxBytes) {
                    log.error("IPFS content {} exceeds cap of {} bytes", cid, maxBytes);
                    return new Attempt(null, false);
                }
                return new Attempt(bytes, false);
            }
        } catch (Exception e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            log.error("Failed to fetch IPFS content {} from {}: {}", cid, gateway, e.getMessage());
            return new Attempt(null, false);
        }
    }
}
