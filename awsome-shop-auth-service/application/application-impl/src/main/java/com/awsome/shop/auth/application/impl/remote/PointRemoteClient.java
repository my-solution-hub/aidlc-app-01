package com.awsome.shop.auth.application.impl.remote;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

/**
 * 积分服务远程客户端
 *
 * <p>封装对 point-service 内部接口的 HTTP 调用。
 * 注册成功后调用此客户端初始化新用户的积分账户（BR-AUTH-007）。</p>
 *
 * <p>降级策略：调用失败仅记录告警日志，不影响注册结果。</p>
 */
@Slf4j
@Component
public class PointRemoteClient {

    private static final String SUCCESS_CODE = "SUCCESS";

    /** 跨服务调用超时（3 秒） */
    private static final Duration CALL_TIMEOUT = Duration.ofSeconds(3);

    private final WebClient webClient;
    private final String pointBaseUrl;

    public PointRemoteClient(WebClient.Builder webClientBuilder,
                             @Value("${shop.remote.point.base-url:http://localhost:8003}") String pointBaseUrl) {
        this.webClient = webClientBuilder.build();
        this.pointBaseUrl = pointBaseUrl;
    }

    /**
     * 初始化用户积分账户（best-effort，失败仅告警不抛出）。
     *
     * @param userId 新注册用户ID
     */
    public void initPointAccount(Long userId) {
        String url = pointBaseUrl + "/api/v1/internal/point/adjust";
        try {
            JsonNode response = webClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "userId", userId,
                            "amount", 0,
                            "direction", "INIT",
                            "type", "INIT",
                            "description", "注册初始化"))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block(CALL_TIMEOUT);

            String code = response == null ? null : response.path("code").asText(null);
            if (!SUCCESS_CODE.equals(code)) {
                String message = response == null ? "返回为空" : response.path("message").asText("");
                log.warn("初始化积分账户失败(降级), userId={}, code={}, message={}", userId, code, message);
            }
        } catch (Exception e) {
            log.warn("初始化积分账户异常(降级), userId={}, url={}, error={}", userId, url, e.getMessage());
        }
    }
}
