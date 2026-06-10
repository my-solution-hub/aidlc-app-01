package com.awsome.shop.product.application.api.dto.product.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 库存增减请求（内部，供 order 兑换/补偿调用）
 */
@Data
public class StockRequest {

    @NotNull(message = "商品ID不能为空")
    private Long productId;

    @NotNull(message = "数量不能为空")
    private Integer quantity;
}
