package com.awsome.shop.auth.application.api.dto.user.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 创建用户请求（管理员）
 */
@Data
public class CreateUserRequest {

    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    private String nickname;

    private String role = "EMPLOYEE";
}
