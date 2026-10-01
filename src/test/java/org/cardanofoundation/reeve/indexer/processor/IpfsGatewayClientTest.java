package org.cardanofoundation.reeve.indexer.processor;

import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.Executors;

import org.springframework.test.util.ReflectionTestUtils;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/**
 * Boundary tests for {@link IpfsGatewayClient#fetchBytes(String, long)} against a real HTTP
 * server (JDK's built-in {@link HttpServer}, no new test dependency) so cap/overflow/error
 * handling is exercised end-to-end rather than mocked.
 */
class IpfsGatewayClientTest {

    private static final long MAX_BYTES = 1024;

    private HttpServer server;

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void bodyExactlyAtCapIsReturned() throws IOException {
        byte[] body = new byte[(int) MAX_BYTES];
        server = startServer(exchange -> {
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(body);
            }
        });
        IpfsGatewayClient client = clientFor(gatewayUrl(server));

        Optional<byte[]> result = client.fetchBytes("cid-at-cap", MAX_BYTES);

        assertTrue(result.isPresent());
        assertEquals(MAX_BYTES, result.get().length);
    }

    @Test
    void bodyOverCapIsEmpty() throws IOException {
        byte[] body = new byte[(int) MAX_BYTES + 1];
        server = startServer(exchange -> {
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(body);
            }
        });
        IpfsGatewayClient client = clientFor(gatewayUrl(server));

        Optional<byte[]> result = client.fetchBytes("cid-over-cap", MAX_BYTES);

        assertTrue(result.isEmpty());
    }

    @Test
    void httpNotFoundIsEmptyAndDoesNotHang() throws IOException {
        server = startServer(exchange -> {
            exchange.sendResponseHeaders(404, -1);
            exchange.close();
        });
        IpfsGatewayClient client = clientFor(gatewayUrl(server));

        Optional<byte[]> result = assertTimeoutPreemptively(Duration.ofSeconds(5),
                () -> client.fetchBytes("missing-cid", MAX_BYTES));

        assertTrue(result.isEmpty());
    }

    @Test
    void connectionRefusedIsEmpty() throws IOException {
        int freePort;
        try (ServerSocket socket = new ServerSocket(0)) {
            freePort = socket.getLocalPort();
        }
        // Nothing is listening on freePort anymore, so the connection is refused.
        IpfsGatewayClient client = clientFor("http://127.0.0.1:" + freePort + "/ipfs/");

        Optional<byte[]> result = assertTimeoutPreemptively(Duration.ofSeconds(5),
                () -> client.fetchBytes("any-cid", MAX_BYTES));

        assertTrue(result.isEmpty());
    }

    private static IpfsGatewayClient clientFor(String gatewayUrl) {
        IpfsGatewayClient client = new IpfsGatewayClient();
        ReflectionTestUtils.setField(client, "ipfsGateway", gatewayUrl);
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
