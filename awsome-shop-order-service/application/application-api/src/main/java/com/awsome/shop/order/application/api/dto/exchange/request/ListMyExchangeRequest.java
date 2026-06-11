package com.awsome.shop.order.application.api.dto.exchange.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 员工查询自己兑换记录请求
 */
@Data
public class ListMyExchangeRequest {

    @Min(value = 1, message = "页码最小为 1")
    private Integer page = 1;

    @Min(value = 1, message = "每页大小最小为 1")
    @Max(value = 100, message = "每页大小最大为 100")
    private Integer size = 20;

    /**
     * 兑换员工用户ID（由网关注入）
     */
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    /**
     * 状态过滤（可选）
     */
    private String status;

    /**
     * 关键词模糊查询（订单编号/商品名称，可选）
     */
    private String keyword;
}
