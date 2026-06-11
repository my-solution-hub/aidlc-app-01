package com.awsome.shop.order.application.impl.saga;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

/**
 * 兑换流程远程服务客户端
 *
 * <p>封装对 product-service / point-service 内部接口的 HTTP 调用，
 * 统一解包 {"code","message","data"} 响应信封，code != "SUCCESS" 视为失败。</p>
 */
@Slf4j
@Component
public class ExchangeRemoteClient {

    private static final String SUCCESS_CODE = "SUCCESS";

    /** 跨服务调用超时（BR-ORDER-009：3 秒） */
    private static final Duration CALL_TIMEOUT = Duration.ofSeconds(3);

    private final WebClient webClient;
    private final String productBaseUrl;
    private final String pointBaseUrl;

    public ExchangeRemoteClient(WebClient.Builder webClientBuilder,
                                @Value("${shop.remote.product.base-url:http://localhost:8002}") String productBaseUrl,
                                @Value("${shop.remote.point.base-url:http://localhost:8003}") String pointBaseUrl) {
        this.webClient = webClientBuilder.build();
        this.productBaseUrl = productBaseUrl;
        this.pointBaseUrl = pointBaseUrl;
    }

    /**
     * 查询商品详情，返回解包后的 data 节点。
     */
    public JsonNode getProduct(Long productId) {
        JsonNode data = get(productBaseUrl + "/api/products/" + productId, "查询商品");
        if (data == null || data.isNull()) {
            throw new SagaException("商品不存在: " + productId);
        }
        return data;
    }

    /**
     * 扣减库存。
     */
    public void deductStock(Long productId, int quantity) {
        post(productBaseUrl + "/api/internal/products/deduct-stock",
                Map.of("productId", productId, "quantity", quantity), "扣减库存");
    }

    /**
     * 恢复库存（库存补偿）。
     */
    public void restoreStock(Long productId, int quantity) {
        post(productBaseUrl + "/api/internal/products/restore-stock",
                Map.of("productId", productId, "quantity", quantity), "恢复库存");
    }

    /**
     * 扣减积分。
     */
    public Integer deductPoints(Long userId, int amount) {
        JsonNode data = post(pointBaseUrl + "/api/internal/points/adjust",
                Map.of("userId", userId,
                        "amount", amount,
                        "direction", "DEDUCT",
                        "type", "REDEEM",
                        "description", "兑换商品"), "扣减积分");
        return data != null && data.has("balance") ? data.get("balance").asInt() : null;
    }

    /**
     * 退还积分（积分补偿）。
     */
    public void refundPoints(Long userId, int amount) {
        post(pointBaseUrl + "/api/internal/points/adjust",
                Map.of("userId", userId,
                        "amount", amount,
                        "direction", "ADD",
                        "type", "REFUND",
                        "description", "兑换商品"), "退还积分");
    }

    /**
     * 发送 GET 请求并解包响应信封，失败抛出 {@link SagaException}。
     */
    private JsonNode get(String url, String action) {
        JsonNode response;
        try {
            response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block(CALL_TIMEOUT);
        } catch (Exception e) {
            log.error("{} 远程调用异常, url={}", action, url, e);
            throw new SagaException(action + "远程调用异常: " + e.getMessage(), e);
        }
        return unwrap(response, url, action);
    }

    /**
     * 发送 POST 请求并解包响应信封，失败抛出 {@link SagaException}。
     */
    private JsonNode post(String url, Object body, String action) {
        JsonNode response;
        try {
            response = webClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block(CALL_TIMEOUT);
        } catch (Exception e) {
            log.error("{} 远程调用异常, url={}", action, url, e);
            throw new SagaException(action + "远程调用异常: " + e.getMessage(), e);
        }
        return unwrap(response, url, action);
    }

    /**
     * 解包 {"code","message","data"} 响应信封，code != "SUCCESS" 视为失败。
     */
    private JsonNode unwrap(JsonNode response, String url, String action) {
        if (response == null) {
            throw new SagaException(action + "返回为空");
        }

        JsonNode codeNode = response.get("code");
        String code = codeNode == null ? null : codeNode.asText();
        if (!SUCCESS_CODE.equals(code)) {
            String message = response.path("message").asText("");
            log.warn("{} 失败, url={}, code={}, message={}", action, url, code, message);
            throw new SagaException(action + "失败: " + message);
        }
        return response.get("data");
    }
}
