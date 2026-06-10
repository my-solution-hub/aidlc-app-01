package com.awsome.shop.auth.application.api.dto.user.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新用户状态请求（启用/禁用账户）
 */
@Data
public class UpdateUserStatusRequest {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotBlank(message = "状态不能为空")
    private String status;
}
