package com.awsome.shop.order.application.api.dto.exchange.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 员工兑换下单请求
 */
@Data
public class ExchangeRequest {

    /**
     * 商品ID
     */
    @NotNull(message = "商品ID不能为空")
    private Long productId;

    /**
     * 兑换数量（默认 1）
     */
    @Min(value = 1, message = "兑换数量最小为 1")
    private Integer quantity = 1;

    /**
     * 兑换员工用户ID（由网关注入）
     */
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    /**
     * 兑换员工姓名（由网关注入）
     */
    private String employeeName;
    private Long addressId;

    /**
     * 幂等键 (ORD-5) — 前端生成的 UUID，防止重复提交
     */
    private String idempotencyKey;
}
