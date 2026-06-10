package com.awsome.shop.product.application.api.dto.product.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新商品状态请求（上架/下架）
 */
@Data
public class UpdateProductStatusRequest {

    @NotNull(message = "商品ID不能为空")
    private Long id;

    @NotNull(message = "状态不能为空")
    private Integer status;
}
