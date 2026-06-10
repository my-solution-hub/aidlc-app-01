package com.awsome.shop.point.integration;

import com.awsome.shop.point.common.exception.BusinessException;
import com.awsome.shop.point.domain.model.account.PointAccountEntity;
import com.awsome.shop.point.domain.service.account.PointAccountDomainService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * PTS-6: 积分防超扣 — 集成测试（本地 MySQL + Redis）
 *
 * 前置条件: 本地 MySQL (localhost:3306) 有 awsome_shop_points 库，Redis (localhost:6379)
 * 运行方式: mvn test -pl bootstrap -Dtest="PointAccountAtomicDeductIntegrationTest"
 *
 * 验证真实数据库的 atomicDeduct SQL 在并发场景下不会超扣。
 */
@SpringBootTest(classes = com.awsome.shop.point.bootstrap.Application.class)
@ActiveProfiles("test")
class PointAccountAtomicDeductIntegrationTest {

    @Autowired
    private PointAccountDomainService pointAccountDomainService;

    private static final Long TEST_USER_ID = 99999L;

    @BeforeEach
    void setUp() {
        // 确保测试用户有 1000 积分
        PointAccountEntity account = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        int currentBalance = account.getBalance();
        if (currentBalance < 1000) {
            pointAccountDomainService.add(TEST_USER_ID, 1000 - currentBalance, "ADJUST", "集成测试重置余额");
        } else if (currentBalance > 1000) {
            // 余额过多时扣减到 1000
            pointAccountDomainService.deduct(TEST_USER_ID, currentBalance - 1000, "集成测试重置余额");
        }
    }

    @Test
    @DisplayName("正常扣减 — 余额充足时扣减成功，数据库余额正确")
    void deduct_sufficientBalance_succeeds() {
        PointAccountEntity result = pointAccountDomainService.deduct(TEST_USER_ID, 300, "集成测试正常扣减");

        assertThat(result.getBalance()).isEqualTo(700);

        // 重新从数据库读取验证
        PointAccountEntity fromDb = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        assertThat(fromDb.getBalance()).isEqualTo(700);
    }

    @Test
    @DisplayName("防超扣 — 余额不足时抛异常，数据库余额不变")
    void deduct_insufficientBalance_throwsAndBalanceUnchanged() {
        PointAccountEntity before = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        int balanceBefore = before.getBalance();

        assertThatThrownBy(() -> pointAccountDomainService.deduct(TEST_USER_ID, balanceBefore + 1, "超额扣减"))
                .isInstanceOf(BusinessException.class);

        // 从数据库验证余额未变
        PointAccountEntity after = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        assertThat(after.getBalance()).isEqualTo(balanceBefore);
    }

    @Test
    @DisplayName("边界值 — 恰好扣完全部余额")
    void deduct_exactBalance_zeroRemaining() {
        PointAccountEntity result = pointAccountDomainService.deduct(TEST_USER_ID, 1000, "全额扣减");
        assertThat(result.getBalance()).isEqualTo(0);

        PointAccountEntity fromDb = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        assertThat(fromDb.getBalance()).isEqualTo(0);
    }

    @Test
    @DisplayName("并发防超扣 — 10 线程同时扣减，总扣减不超过余额，余额不为负")
    void deduct_concurrent_noOverselling() throws InterruptedException {
        // 确保余额为 500
        PointAccountEntity account = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        int currentBalance = account.getBalance();
        if (currentBalance < 500) {
            pointAccountDomainService.add(TEST_USER_ID, 500 - currentBalance, "ADJUST", "并发测试初始化");
        } else if (currentBalance > 500) {
            pointAccountDomainService.deduct(TEST_USER_ID, currentBalance - 500, "并发测试初始化");
        }

        int initialBalance = pointAccountDomainService.getOrCreate(TEST_USER_ID).getBalance();
        assertThat(initialBalance).isEqualTo(500);

        // 10 个线程，每个尝试扣减 100（总计 1000 > 余额 500）
        int threadCount = 10;
        int deductPerThread = 100;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        List<Future<Boolean>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                startLatch.await(); // 所有线程等待同时开始
                try {
                    pointAccountDomainService.deduct(TEST_USER_ID, deductPerThread, "并发扣减");
                    return true;
                } catch (BusinessException e) {
                    return false; // 余额不足
                }
            }));
        }

        // 放行所有线程同时执行
        startLatch.countDown();

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);

        // 统计成功次数
        long successCount = futures.stream().filter(f -> {
            try { return f.get(); } catch (Exception e) { return false; }
        }).count();

        // 核心断言：
        // 1. 成功次数 * 100 <= 初始余额 500（最多成功 5 次）
        assertThat(successCount * deductPerThread).isLessThanOrEqualTo(initialBalance);

        // 2. 最终余额 >= 0（永远不会为负 — 这是 atomicDeduct 的核心保证）
        PointAccountEntity finalAccount = pointAccountDomainService.getOrCreate(TEST_USER_ID);
        assertThat(finalAccount.getBalance()).isGreaterThanOrEqualTo(0);

        // 3. 最终余额 = 初始余额 - 成功次数 * 100
        assertThat(finalAccount.getBalance()).isEqualTo(initialBalance - (int)(successCount * deductPerThread));

        System.out.printf("[并发测试结果] 初始余额=%d, 线程数=%d, 每线程扣=%d, 成功=%d, 最终余额=%d%n",
                initialBalance, threadCount, deductPerThread, successCount, finalAccount.getBalance());
    }
}
