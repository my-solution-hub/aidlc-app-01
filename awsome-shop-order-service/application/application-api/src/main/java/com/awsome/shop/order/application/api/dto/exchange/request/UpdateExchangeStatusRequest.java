package com.awsome.shop.order.application.api.dto.exchange.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新积分兑换记录状态请求
 */
@Data
public class UpdateExchangeStatusRequest {

    /**
     * 兑换记录ID
     */
    @NotNull(message = "ID不能为空")
    private Long id;

    /**
     * 目标状态: PENDING_DELIVERY/DELIVERING/COMPLETED/CANCELLED
     */
    @NotBlank(message = "状态不能为空")
    private String status;

    /**
     * 物流单号（可选）
     */
    private String trackingNumber;
}
