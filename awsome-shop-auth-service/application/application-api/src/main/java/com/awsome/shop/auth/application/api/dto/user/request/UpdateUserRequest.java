package com.awsome.shop.auth.application.api.dto.user.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新用户信息请求（昵称、角色、工号）
 */
@Data
public class UpdateUserRequest {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    private String nickname;

    private String role;

    private String employeeId;
}
