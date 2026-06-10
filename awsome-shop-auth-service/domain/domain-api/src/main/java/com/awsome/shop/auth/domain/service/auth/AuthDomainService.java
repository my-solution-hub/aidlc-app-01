package com.awsome.shop.auth.domain.service.auth;

import com.awsome.shop.auth.domain.model.user.UserEntity;

/**
 * 认证领域服务接口
 */
public interface AuthDomainService {

    /**
     * 用户登录
     *
     * @param username 用户名
     * @param password 密码
     * @return 登录成功的用户实体
     */
    UserEntity login(String username, String password);

    /**
     * 用户登出
     *
     * @param token JWT Token
     */
    void logout(String token);

    /**
     * 校验 Token 有效性（网关鉴权调用）。
     * 校验签名/过期，并检查是否在登出黑名单中。
     *
     * @param token JWT Token
     * @return 有效则返回用户ID字符串，无效返回 null
     */
    String validateToken(String token);
}
