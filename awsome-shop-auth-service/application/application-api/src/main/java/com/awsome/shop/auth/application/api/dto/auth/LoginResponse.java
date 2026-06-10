package com.awsome.shop.auth.application.api.dto.auth;

import lombok.Data;

/**
 * 登录响应
 */
@Data
public class LoginResponse {

    private String token;

    private Long userId;

    private String username;

    private String nickname;

    private String role;
}
