package com.awsome.shop.gateway.infrastructure.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

/**
 * 网关限流配置 (GW-1)
 *
 * <p>基于 Redis + Spring Cloud Gateway RequestRateLimiter 实现。
 * 限流策略：按客户端 IP 限流，未认证请求按 IP，已认证请求按 userId。</p>
 */
@Configuration
public class RateLimitingConfig {

    /**
     * 限流 Key 解析器：优先使用 X-Operator-Id（已认证用户），否则使用客户端 IP。
     */
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String operatorId = exchange.getRequest().getHeaders().getFirst("X-Operator-Id");
            if (operatorId != null && !operatorId.isBlank()) {
                return Mono.just("user:" + operatorId);
            }
            String ip = exchange.getRequest().getRemoteAddress() != null
                    ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                    : "unknown";
            return Mono.just("ip:" + ip);
        };
    }
}
