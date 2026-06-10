package com.awsome.shop.gateway.infrastructure.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.test.StepVerifier;

import java.net.InetSocketAddress;

/**
 * GW-1: 限流 Key 解析器单元测试
 */
class RateLimitingConfigTest {

    private final RateLimitingConfig config = new RateLimitingConfig();
    private final KeyResolver keyResolver = config.userKeyResolver();

    @Test
    @DisplayName("已认证用户 — 使用 X-Operator-Id 作为限流 key")
    void resolve_authenticatedUser_usesOperatorId() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/products")
                .header("X-Operator-Id", "42")
                .remoteAddress(new InetSocketAddress("192.168.1.100", 12345))
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNext("user:42")
                .verifyComplete();
    }

    @Test
    @DisplayName("未认证用户 — 使用客户端 IP 作为限流 key")
    void resolve_anonymousUser_usesIpAddress() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/auth/login")
                .remoteAddress(new InetSocketAddress("10.0.0.5", 54321))
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNext("ip:10.0.0.5")
                .verifyComplete();
    }

    @Test
    @DisplayName("X-Operator-Id 为空字符串 — 回退到 IP")
    void resolve_emptyOperatorId_fallsBackToIp() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/orders")
                .header("X-Operator-Id", "  ")
                .remoteAddress(new InetSocketAddress("172.16.0.1", 8080))
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        StepVerifier.create(keyResolver.resolve(exchange))
                .expectNext("ip:172.16.0.1")
                .verifyComplete();
    }
}
