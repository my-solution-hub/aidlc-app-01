package com.awsome.shop.point.application.impl.remote;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

/**
 * 认证服务远程客户端
 *
 * <p>员工积分列表（US-020）需展示 username/nickname/工号，这些字段归属 auth-service，
 * 由本客户端调用 auth 的 {@code GET /api/admin/users/{id}} 充填。</p>
 *
 * <p>降级策略：调用失败仅记录告警并返回 null，不影响积分列表主体数据。</p>
 */
@Slf4j
@Component
public class UserRemoteClient {

    private static final String SUCCESS_CODE = "SUCCESS";

    /** 跨服务调用超时（3 秒） */
    private static final Duration CALL_TIMEOUT = Duration.ofSeconds(3);

    private final WebClient webClient;
    private final String authBaseUrl;

    public UserRemoteClient(WebClient.Builder webClientBuilder,
                            @Value("${shop.remote.auth.base-url:http://localhost:8001}") String authBaseUrl) {
        this.webClient = webClientBuilder.build();
        this.authBaseUrl = authBaseUrl;
    }

    /**
     * 查询单个用户信息，返回解包后的 data 节点；失败返回 null（降级）。
     */
    public JsonNode getUser(Long userId) {
        String url = authBaseUrl + "/api/admin/users/" + userId;
        try {
            JsonNode response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block(CALL_TIMEOUT);
            String code = response == null ? null : response.path("code").asText(null);
            if (!SUCCESS_CODE.equals(code)) {
                log.warn("查询用户信息失败(降级), userId={}, code={}", userId, code);
                return null;
            }
            return response.get("data");
        } catch (Exception e) {
            log.warn("查询用户信息异常(降级), userId={}, url={}, error={}", userId, url, e.getMessage());
            return null;
        }
    }
}
