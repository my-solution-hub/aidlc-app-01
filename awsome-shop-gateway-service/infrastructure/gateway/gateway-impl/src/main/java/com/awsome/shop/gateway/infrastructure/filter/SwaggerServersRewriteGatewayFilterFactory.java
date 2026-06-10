package com.awsome.shop.gateway.infrastructure.filter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.cloud.gateway.filter.factory.rewrite.ModifyResponseBodyGatewayFilterFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Route-specific filter to rewrite OpenAPI servers URL to the gateway URL.
 *
 * <p>This ensures Swagger UI "Try it out" sends requests through the gateway
 * rather than directly to backend services.</p>
 *
 * <p>Uses Spring Cloud Gateway's built-in {@link ModifyResponseBodyGatewayFilterFactory}
 * to reliably intercept and modify proxied response bodies.</p>
 *
 * <p>Usage in route config:</p>
 * <pre>
 * filters:
 *   - SwaggerServersRewrite
 * </pre>
 */
@Slf4j
@Component
public class SwaggerServersRewriteGatewayFilterFactory
        extends AbstractGatewayFilterFactory<SwaggerServersRewriteGatewayFilterFactory.Config> {

    private final ModifyResponseBodyGatewayFilterFactory modifyResponseBodyFilterFactory;
    private final ObjectMapper objectMapper;

    public SwaggerServersRewriteGatewayFilterFactory(
            ModifyResponseBodyGatewayFilterFactory modifyResponseBodyFilterFactory,
            ObjectMapper objectMapper) {
        super(Config.class);
        this.modifyResponseBodyFilterFactory = modifyResponseBodyFilterFactory;
        this.objectMapper = objectMapper;
    }

    @Override
    public GatewayFilter apply(Config config) {
        ModifyResponseBodyGatewayFilterFactory.Config modifyConfig =
                new ModifyResponseBodyGatewayFilterFactory.Config();
        modifyConfig.setInClass(byte[].class);
        modifyConfig.setOutClass(byte[].class);
        modifyConfig.setNewContentType(MediaType.APPLICATION_JSON_VALUE);
        modifyConfig.setRewriteFunction(byte[].class, byte[].class, (exchange, body) -> {
            if (body == null || body.length == 0) {
                return Mono.justOrEmpty(body);
            }

            String responseBody = new String(body);
            String requestPath = exchange.getRequest().getURI().getPath();

            // Build gateway URL with service prefix
            var uri = exchange.getRequest().getURI();
            String scheme = uri.getScheme();
            String host = uri.getHost();
            int port = uri.getPort();

            String baseUrl;
            if (port == -1 || port == 80 || port == 443) {
                baseUrl = scheme + "://" + host;
            } else {
                baseUrl = scheme + "://" + host + ":" + port;
            }

            // Extract service name from original request path: /v3/api-docs/{service-name}
            String serviceName = extractServiceName(requestPath);
            String gatewayUrl = serviceName != null ? baseUrl + "/" + serviceName : baseUrl;

            String modifiedBody = rewriteServers(responseBody, gatewayUrl);
            return Mono.just(modifiedBody.getBytes());
        });

        return modifyResponseBodyFilterFactory.apply(modifyConfig);
    }

    private String rewriteServers(String responseBody, String gatewayUrl) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            if (root.isObject()) {
                ObjectNode rootObj = (ObjectNode) root;
                ArrayNode servers = objectMapper.createArrayNode();
                ObjectNode server = objectMapper.createObjectNode();
                server.put("url", gatewayUrl);
                server.put("description", "Gateway");
                servers.add(server);
                rootObj.set("servers", servers);
                return objectMapper.writeValueAsString(rootObj);
            }
        } catch (JsonProcessingException e) {
            log.warn("Failed to rewrite Swagger servers: {}", e.getMessage());
        }
        return responseBody;
    }

    private String extractServiceName(String path) {
        if (path == null) {
            return null;
        }
        String prefix = "/v3/api-docs/";
        if (path.startsWith(prefix) && path.length() > prefix.length()) {
            return path.substring(prefix.length());
        }
        return null;
    }

    @Data
    public static class Config {
        // No additional config needed
    }
}
