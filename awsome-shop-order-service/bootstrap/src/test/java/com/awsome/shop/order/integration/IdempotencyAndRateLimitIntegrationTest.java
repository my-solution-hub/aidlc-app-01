package com.awsome.shop.order.integration;

import com.awsome.shop.order.application.impl.service.exchange.ExchangeRateLimitService;
import com.awsome.shop.order.application.impl.service.exchange.IdempotencyService;
import com.awsome.shop.order.bootstrap.Application;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ORD-5 幂等性 + ORD-6 限频 — 集成测试（本地 Redis）
 *
 * 前置条件: 本地 Redis 运行在 localhost:6379
 * 运行方式: mvn test -Dtest="IdempotencyAndRateLimitIntegrationTest" -pl bootstrap
 */
@SpringBootTest(classes = Application.class)
@ActiveProfiles("test")
class IdempotencyAndRateLimitIntegrationTest {

    @Autowired
    private IdempotencyService idempotencyService;

    @Autowired
    private ExchangeRateLimitService rateLimitService;

    @Autowired
    private StringRedisTemplate redisTemplate;

    // ==================== 幂等性测试 (ORD-5) ====================

    @Nested
    @DisplayName("IdempotencyService — Redis SET NX 幂等锁")
    class IdempotencyTests {

        @Test
        @DisplayName("首次请求 — 获取锁成功")
        void tryAcquire_firstTime_returnsTrue() {
            String key = "itest-idempotent-" + System.nanoTime();
            boolean result = idempotencyService.tryAcquire(key);
            assertThat(result).isTrue();
            // 清理
            idempotencyService.release(key);
        }

        @Test
        @DisplayName("重复请求 — 获取锁失败（幂等拦截）")
        void tryAcquire_duplicate_returnsFalse() {
            String key = "itest-duplicate-" + System.nanoTime();

            boolean first = idempotencyService.tryAcquire(key);
            boolean second = idempotencyService.tryAcquire(key);

            assertThat(first).isTrue();
            assertThat(second).isFalse();
            // 清理
            idempotencyService.release(key);
        }

        @Test
        @DisplayName("释放后可重新获取")
        void release_thenReacquire_succeeds() {
            String key = "itest-release-" + System.nanoTime();

            idempotencyService.tryAcquire(key);
            idempotencyService.release(key);
            boolean reacquire = idempotencyService.tryAcquire(key);

            assertThat(reacquire).isTrue();
            // 清理
            idempotencyService.release(key);
        }

        @Test
        @DisplayName("空 key — 不做幂等检查，返回 true")
        void tryAcquire_nullKey_returnsTrue() {
            assertThat(idempotencyService.tryAcquire(null)).isTrue();
            assertThat(idempotencyService.tryAcquire("")).isTrue();
            assertThat(idempotencyService.tryAcquire("   ")).isTrue();
        }

        @Test
        @DisplayName("Redis 中确实存在 key")
        void tryAcquire_keyExistsInRedis() {
            String key = "itest-verify-" + System.nanoTime();
            idempotencyService.tryAcquire(key);

            String redisKey = "exchange:idempotent:" + key;
            assertThat(redisTemplate.hasKey(redisKey)).isTrue();
            // 清理
            redisTemplate.delete(redisKey);
        }
    }

    // ==================== 限频测试 (ORD-6) ====================

    @Nested
    @DisplayName("ExchangeRateLimitService — Redis 滑动窗口限频")
    class RateLimitTests {

        @Test
        @DisplayName("前 3 次请求 — 允许通过")
        void allowExchange_first3_allowed() {
            Long userId = 88880L + System.nanoTime() % 100000;

            assertThat(rateLimitService.allowExchange(userId)).isTrue();
            assertThat(rateLimitService.allowExchange(userId)).isTrue();
            assertThat(rateLimitService.allowExchange(userId)).isTrue();
            // 清理
            redisTemplate.delete("exchange:ratelimit:" + userId);
        }

        @Test
        @DisplayName("第 4 次请求 — 被限频拒绝")
        void allowExchange_4th_rejected() {
            Long userId = 99990L + System.nanoTime() % 100000;

            rateLimitService.allowExchange(userId);
            rateLimitService.allowExchange(userId);
            rateLimitService.allowExchange(userId);
            boolean fourth = rateLimitService.allowExchange(userId);

            assertThat(fourth).isFalse();
            // 清理
            redisTemplate.delete("exchange:ratelimit:" + userId);
        }

        @Test
        @DisplayName("不同用户互不影响")
        void allowExchange_differentUsers_independent() {
            Long userA = 11110L + System.nanoTime() % 100000;
            Long userB = 22220L + System.nanoTime() % 100000;

            rateLimitService.allowExchange(userA);
            rateLimitService.allowExchange(userA);
            rateLimitService.allowExchange(userA);
            rateLimitService.allowExchange(userA); // 超频

            assertThat(rateLimitService.allowExchange(userB)).isTrue();
            // 清理
            redisTemplate.delete("exchange:ratelimit:" + userA);
            redisTemplate.delete("exchange:ratelimit:" + userB);
        }
    }
}
