package com.awsome.shop.auth.infrastructure.cache.redis.impl;

import com.awsome.shop.auth.infrastructure.cache.api.service.TokenCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Token 缓存服务 Redis 实现
 */
@Service
@RequiredArgsConstructor
public class TokenCacheServiceImpl implements TokenCacheService {

    private static final String BLACKLIST_KEY_PREFIX = "auth:token:blacklist:";

    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public void addToBlacklist(String token, long expireSeconds) {
        String key = BLACKLIST_KEY_PREFIX + token;
        stringRedisTemplate.opsForValue().set(key, "1", expireSeconds, TimeUnit.SECONDS);
    }

    @Override
    public boolean isBlacklisted(String token) {
        String key = BLACKLIST_KEY_PREFIX + token;
        return Boolean.TRUE.equals(stringRedisTemplate.hasKey(key));
    }
}
