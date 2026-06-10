package com.awsome.shop.order.application.impl.service.exchange;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * 兑换幂等性服务 (ORD-5)
 *
 * <p>基于 Redis SET NX + TTL 实现幂等检查。
 * 同一 idempotencyKey 在 TTL 内只允许执行一次。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private static final String KEY_PREFIX = "exchange:idempotent:";
    private static final Duration DEFAULT_TTL = Duration.ofMinutes(10);

    private final StringRedisTemplate redisTemplate;

    /**
     * 尝试获取幂等锁。
     *
     * @param idempotencyKey 幂等键（前端生成的 UUID）
     * @return true 表示首次请求（可执行），false 表示重复请求（应拒绝）
     */
    public boolean tryAcquire(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return true; // 未提供幂等键时不做限制（向后兼容）
        }
        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(KEY_PREFIX + idempotencyKey, "1", DEFAULT_TTL);
        return Boolean.TRUE.equals(success);
    }

    /**
     * 释放幂等锁（用于操作失败时允许重试）。
     */
    public void release(String idempotencyKey) {
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            redisTemplate.delete(KEY_PREFIX + idempotencyKey);
        }
    }
}
