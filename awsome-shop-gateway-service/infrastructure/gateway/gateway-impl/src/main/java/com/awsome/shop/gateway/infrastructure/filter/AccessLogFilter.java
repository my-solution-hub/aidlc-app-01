package com.awsome.shop.gateway.infrastructure.filter;

import com.awsome.shop.gateway.common.constants.RouteConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.util.Optional;
import java.util.UUID;

/**
 * Global filter for access logging and request ID generation.
 *
 * <p>Order: HIGHEST_PRECEDENCE - executes first in the filter chain.</p>
 */
@Slf4j
@Component
public class AccessLogFilter implements GlobalFilter, Ordered {

    private static final String HEADER_X_FORWARDED_FOR = "X-Forwarded-For";
    private static final String HEADER_X_REAL_IP = "X-Real-IP";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();
        String requestId = generateRequestId();

        // Store attributes for downstream filters
        exchange.getAttributes().put(RouteConstants.ATTR_REQUEST_ID, requestId);
        exchange.getAttributes().put(RouteConstants.ATTR_REQUEST_START_TIME, startTime);

        // Add request ID to request headers
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header(RouteConstants.HEADER_REQUEST_ID, requestId)
                .build();

        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(mutatedRequest)
                .build();

        String clientIp = extractClientIp(exchange);
        String method = exchange.getRequest().getMethod().name();
        String path = exchange.getRequest().getURI().getPath();

        log.info("[{}] >>> {} {} from {}", requestId, method, path, clientIp);

        return chain.filter(mutatedExchange).then(Mono.fromRunnable(() -> {
            long duration = System.currentTimeMillis() - startTime;
            int statusCode = Optional.ofNullable(exchange.getResponse().getStatusCode())
                    .map(s -> s.value())
                    .orElse(0);
            log.info("[{}] <<< {} {} - {} ({}ms)", requestId, method, path, statusCode, duration);
        }));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    private String generateRequestId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    private String extractClientIp(ServerWebExchange exchange) {
        ServerHttpRequest request = exchange.getRequest();

        // Check X-Forwarded-For header
        String xForwardedFor = request.getHeaders().getFirst(HEADER_X_FORWARDED_FOR);
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        // Check X-Real-IP header
        String xRealIp = request.getHeaders().getFirst(HEADER_X_REAL_IP);
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        // Fall back to remote address
        return Optional.ofNullable(request.getRemoteAddress())
                .map(InetSocketAddress::getAddress)
                .map(InetAddress::getHostAddress)
                .orElse("unknown");
    }
}
