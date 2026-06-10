package com.awsome.shop.auth.infrastructure.cache.api.service;

/**
 * Token 缓存服务接口
 *
 * <p>用于管理 JWT Token 的黑名单（登出时将 Token 加入黑名单）</p>
 */
public interface TokenCacheService {

    /**
     * 将 Token 加入黑名单
     *
     * @param token          JWT Token
     * @param expireSeconds  过期时间（秒），应与 Token 剩余有效期一致
     */
    void addToBlacklist(String token, long expireSeconds);

    /**
     * 检查 Token 是否在黑名单中
     *
     * @param token JWT Token
     * @return true-已被列入黑名单 false-未被列入黑名单
     */
    boolean isBlacklisted(String token);
}
