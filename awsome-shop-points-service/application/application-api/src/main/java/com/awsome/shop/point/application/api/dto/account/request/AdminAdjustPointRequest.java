package com.awsome.shop.point.application.api.dto.account.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 管理端手动调整积分请求（US-021）
 *
 * <p>amount 非零整数：正数增加，负数扣减；reason 必填 1-200 字符。</p>
 */
@Data
public class AdminAdjustPointRequest {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotNull(message = "积分数量不能为空")
    private Integer amount;

    @NotNull(message = "调整原因不能为空")
    @Size(min = 1, max = 200, message = "调整原因长度必须为 1-200 字符")
    private String reason;
}
