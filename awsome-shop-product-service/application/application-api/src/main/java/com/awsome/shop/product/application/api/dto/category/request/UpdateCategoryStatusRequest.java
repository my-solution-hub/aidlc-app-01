package com.awsome.shop.product.application.api.dto.category.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新类目状态请求（启用/禁用）
 */
@Data
public class UpdateCategoryStatusRequest {

    @NotNull(message = "类目ID不能为空")
    private Long id;

    @NotNull(message = "状态不能为空")
    private Integer status;
}
