package com.awsome.shop.auth.application.api.service.auth;

import com.awsome.shop.auth.application.api.dto.auth.LoginRequest;
import com.awsome.shop.auth.application.api.dto.auth.LoginResponse;
import com.awsome.shop.auth.application.api.dto.auth.TokenValidation;

/**
 * 认证应用服务接口
 */
public interface AuthApplicationService {

    LoginResponse login(LoginRequest request);

    void logout(String token);

    /** 校验 token，有效返回 userId 字符串，无效返回 null（网关鉴权调用） */
    String validateToken(String token);

    /** 校验 token，返回携带 operatorId 与 role 的结果（网关鉴权调用） */
    TokenValidation validateTokenDetail(String token);

    /** 修改密码 (AUTH-3) */
    void changePassword(Long userId, String oldPassword, String newPassword);

    /** 刷新 Token (AUTH-6) */
    String refreshToken(String token);
}
