package com.awsome.shop.order.application.impl.service.exchange;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * 兑换频率限制服务 (ORD-6)
 *
 * <p>基于 Redis 滑动窗口限制同一用户在单位时间内的兑换次数。
 * 默认策略: 同一用户 1 分钟内最多 3 次兑换。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeRateLimitService {

    private static final String KEY_PREFIX = "exchange:ratelimit:";
    private static final int MAX_EXCHANGES_PER_MINUTE = 3;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final StringRedisTemplate redisTemplate;

    /**
     * 检查并消耗一次兑换配额。
     *
     * @param userId 用户ID
     * @return true 表示允许兑换，false 表示已超频
     */
    public boolean allowExchange(Long userId) {
        String key = KEY_PREFIX + userId;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count == null) {
            return true;
        }
        if (count == 1L) {
            redisTemplate.expire(key, WINDOW);
        }
        return count <= MAX_EXCHANGES_PER_MINUTE;
    }
}
