package com.awsome.shop.auth.application.impl.remote;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.*;
import org.springframework.web.reactive.function.client.WebClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * P0-AUTH-2: 注册时初始化积分 — PointRemoteClient 单元测试
 */
class PointRemoteClientTest {

    private MockWebServer mockWebServer;
    private PointRemoteClient pointRemoteClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() throws Exception {
        mockWebServer = new MockWebServer();
        mockWebServer.start();
        String baseUrl = mockWebServer.url("").toString();
        // Remove trailing slash
        baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        pointRemoteClient = new PointRemoteClient(WebClient.builder(), baseUrl);
    }

    @AfterEach
    void tearDown() throws Exception {
        mockWebServer.shutdown();
    }

    @Test
    @DisplayName("初始化积分 - 远程调用成功")
    void initPointAccount_success() throws Exception {
        // given
        mockWebServer.enqueue(new MockResponse()
                .setBody("{\"code\":\"SUCCESS\",\"message\":\"ok\",\"data\":null}")
                .addHeader("Content-Type", "application/json"));

        // when - 不应抛异常
        assertThatCode(() -> pointRemoteClient.initPointAccount(1L))
                .doesNotThrowAnyException();

        // then - 验证请求发出
        RecordedRequest request = mockWebServer.takeRequest();
        assertThat(request.getPath()).isEqualTo("/api/internal/points/adjust");
        assertThat(request.getMethod()).isEqualTo("POST");

        JsonNode body = objectMapper.readTree(request.getBody().readUtf8());
        assertThat(body.get("userId").asLong()).isEqualTo(1L);
        assertThat(body.get("direction").asText()).isEqualTo("INIT");
    }

    @Test
    @DisplayName("初始化积分 - 远程调用失败时降级不抛异常")
    void initPointAccount_remoteFailure_degradesGracefully() {
        // given - 服务返回错误
        mockWebServer.enqueue(new MockResponse()
                .setBody("{\"code\":\"ERROR\",\"message\":\"服务不可用\",\"data\":null}")
                .addHeader("Content-Type", "application/json"));

        // when & then - 降级策略: 失败仅记录日志，不抛出
        assertThatCode(() -> pointRemoteClient.initPointAccount(99L))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("初始化积分 - 网络超时时降级不抛异常")
    void initPointAccount_timeout_degradesGracefully() {
        // given - 不入队任何响应，模拟连接超时
        mockWebServer.enqueue(new MockResponse()
                .setBodyDelay(5, java.util.concurrent.TimeUnit.SECONDS)
                .setBody("{\"code\":\"SUCCESS\"}"));

        // when & then - 3秒超时后降级
        assertThatCode(() -> pointRemoteClient.initPointAccount(1L))
                .doesNotThrowAnyException();
    }
}
