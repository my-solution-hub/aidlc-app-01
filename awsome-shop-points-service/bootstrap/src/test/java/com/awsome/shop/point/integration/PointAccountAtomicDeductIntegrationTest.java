package com.awsome.shop.point.integration;

import com.awsome.shop.point.common.exception.BusinessException;
import com.awsome.shop.point.domain.model.account.PointAccountEntity;
import com.awsome.shop.point.domain.service.account.PointAccountDomainService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * PTS-6: 积分防超扣 — 集成测试（Testcontainers MySQL + Redis）
 *
 * 验证真实数据库的 atomicDeduct SQL 在并发场景下的正确性。
 */
@SpringBootTest
@Testcontainers
class PointAccountAtomicDeductIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("shop_point_test")
            .withUsername("test")
            .withPassword("test");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
        // 禁用积分自动发放调度（测试环境不需要）
        registry.add("points.distribution.cron", () -> "-");
    }

    @Autowired
    private PointAccountDomainService pointAccountDomainService;

    private static final Long TEST_USER_ID = 9999L;

    @BeforeEach
    void setUp() {
        // 初始化测试用户积分账户：余额 1000
        PointAccountEntity account = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        if (account.getBalance() != 1000) {
            // 重置余额到 1000
            if (account.getBalance() < 1000) {
                pointAccountDomainService.add(TEST_USER_ID, 1000 - account.getBalance(), "ADJUST", "测试重置");
            }
        }
    }

    @Test
    @DisplayName("正常扣减 — 余额充足时扣减成功")
    void deduct_sufficientBalance_succeeds() {
        PointAccountEntity result = pointAccountDomainService.deduct(TEST_USER_ID, 300, "测试扣减");

        assertThat(result.getBalance()).isEqualTo(700);
    }

    @Test
    @DisplayName("防超扣 — 余额不足时抛异常，余额不变")
    void deduct_insufficientBalance_throwsAndBalanceUnchanged() {
        // 先查当前余额
        PointAccountEntity before = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        int balanceBefore = before.getBalance();

        // 尝试扣减超过余额的金额
        assertThatThrownBy(() -> pointAccountDomainService.deduct(TEST_USER_ID, balanceBefore + 1, "超额扣减"))
                .isInstanceOf(BusinessException.class);

        // 验证余额未变
        PointAccountEntity after = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        assertThat(after.getBalance()).isEqualTo(balanceBefore);
    }

    @Test
    @DisplayName("并发防超扣 — 10 个线程同时扣减，总扣减不超过余额")
    void deduct_concurrent_noOverselling() throws InterruptedException {
        // 先设置余额为 500
        PointAccountEntity account = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        if (account.getBalance() < 500) {
            pointAccountDomainService.add(TEST_USER_ID, 500 - account.getBalance(), "ADJUST", "并发测试初始化");
        }
        // 获取当前实际余额
        int initialBalance = pointAccountDomainService.getOrCreate(TEST_USER_ID).getBalance();

        // 10 个线程，每个尝试扣减 100（总计 1000 > 余额 500）
        int threadCount = 10;
        int deductPerThread = 100;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        List<Future<Boolean>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                latch.countDown();
                latch.await(); // 所有线程同时开始
                try {
                    pointAccountDomainService.deduct(TEST_USER_ID, deductPerThread, "并发扣减");
                    return true; // 扣减成功
                } catch (BusinessException e) {
                    return false; // 余额不足
                }
            }));
        }

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);

        // 统计成功和失败次数
        long successCount = futures.stream().filter(f -> {
            try { return f.get(); } catch (Exception e) { return false; }
        }).count();

        // 验证：成功次数 * 100 <= 初始余额
        assertThat(successCount * deductPerThread).isLessThanOrEqualTo(initialBalance);

        // 验证：最终余额 >= 0（永远不会为负）
        PointAccountEntity finalAccount = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        assertThat(finalAccount.getBalance()).isGreaterThanOrEqualTo(0);

        // 验证：最终余额 = 初始余额 - 成功次数 * 100
        assertThat(finalAccount.getBalance()).isEqualTo(initialBalance - (int)(successCount * deductPerThread));
    }
}
