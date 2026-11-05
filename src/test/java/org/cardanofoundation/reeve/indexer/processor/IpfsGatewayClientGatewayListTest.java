package org.cardanofoundation.reeve.indexer.processor;

import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.concurrent.Executors;

import org.springframework.test.util.ReflectionTestUtils;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * {@code ipfs.gateway} may hold a comma-separated list of gateways, tried in order. A gateway that
 * answers 429 or 503 is rate-limiting, not reporting missing content: when EVERY gateway does that,
 * {@code fetchBytes} reports it as {@link IpfsGatewayClient.IpfsRateLimitedException} so callers do not
 * count it as a failed attempt. Any other failure keeps the plain "empty" result.
 */
class IpfsGatewayClientGatewayListTest {

    private static final long MAX_BYTES = 1024;
    private static final byte[] BODY = "{\"ok\":true}".getBytes(StandardCharsets.UTF_8);

    private HttpServer first;
    private HttpServer second;

    @AfterEach
    void tearDown() {
        if (first != null) first.stop(0);
        if (second != null) second.stop(0);
    }

    @Test
    void fallsThroughToTheNextGatewayWhenTheFirstFails() throws IOException {
        first = startServer(status(404));
        second = startServer(ok());
        IpfsGatewayClient client = clientFor(gatewayUrl(first) + "," + gatewayUrl(second));

        assertArrayEquals(BODY, client.fetchBytes("cid", MAX_BYTES).orElseThrow());
        assertEquals(new String(BODY, StandardCharsets.UTF_8), client.fetch("cid").orElseThrow());
    }

    @Test
    void skipsARateLimitedGatewayAndUsesTheNextOne() throws IOException {
        first = startServer(status(429));
        second = startServer(ok());
        IpfsGatewayClient client = clientFor(gatewayUrl(first) + "," + gatewayUrl(second));

        assertArrayEquals(BODY, client.fetchBytes("cid", MAX_BYTES).orElseThrow());
    }

    @Test
    void everyGatewayRateLimitedIsReportedAsRateLimited() throws IOException {
        first = startServer(status(429));
        second = startServer(status(503));
        IpfsGatewayClient client = clientFor(gatewayUrl(first) + "," + gatewayUrl(second));

        assertThrows(IpfsGatewayClient.IpfsRateLimitedException.class,
                () -> client.fetchBytes("cid", MAX_BYTES));
        // The String path keeps its empty-on-failure contract (used by funding ingestion).
        assertEquals(Optional.empty(), client.fetch("cid"));
    }

    @Test
    void rateLimitedPlusADefiniteFailureIsAPlainFailure() throws IOException {
        // One gateway that genuinely cannot serve the CID is enough to count the attempt, so content
        // that is really missing still ages out.
        first = startServer(status(429));
        second = startServer(status(404));
        IpfsGatewayClient client = clientFor(gatewayUrl(first) + "," + gatewayUrl(second));

        assertEquals(Optional.empty(), client.fetchBytes("cid", MAX_BYTES));
    }

    @Test
    void entriesAreTrimmedAndATrailingSlashIsAdded() throws IOException {
        first = startServer(ok());
        String withoutSlash = gatewayUrl(first).substring(0, gatewayUrl(first).length() - 1);
        IpfsGatewayClient client = clientFor("  " + withoutSlash + "  , ");

        assertArrayEquals(BODY, client.fetchBytes("cid", MAX_BYTES).orElseThrow());
    }

    private static HttpHandler status(int code) {
        return exchange -> {
            exchange.sendResponseHeaders(code, -1);
            exchange.close();
        };
    }

    private static HttpHandler ok() {
        return exchange -> {
            exchange.sendResponseHeaders(200, BODY.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(BODY);
            }
        };
    }

    private static IpfsGatewayClient clientFor(String gateways) {
        IpfsGatewayClient client = new IpfsGatewayClient();
        ReflectionTestUtils.setField(client, "ipfsGateway", gateways);
        ReflectionTestUtils.setField(client, "requestTimeoutSeconds", 5L);
        return client;
    }

    private static HttpServer startServer(HttpHandler handler) throws IOException {
        HttpServer httpServer = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        httpServer.createContext("/ipfs/", handler);
        httpServer.setExecutor(Executors.newSingleThreadExecutor());
        httpServer.start();
        return httpServer;
    }

    private static String gatewayUrl(HttpServer server) {
        return "http://127.0.0.1:" + server.getAddress().getPort() + "/ipfs/";
    }
}
