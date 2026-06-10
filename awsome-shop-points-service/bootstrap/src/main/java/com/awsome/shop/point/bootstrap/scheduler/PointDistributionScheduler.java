package com.awsome.shop.point.bootstrap.scheduler;

import com.awsome.shop.point.application.api.service.config.PointConfigApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 积分自动发放定时任务（FR-POINT-001, BR-POINTS-008/009）
 *
 * <p>默认每月 1 日凌晨 2:00 执行（cron: {@code 0 0 2 1 * ?}），
 * 为 point_account 表中所有已有账户发放配置额度（type=DISTRIBUTION）。</p>
 *
 * <p>cron 可通过配置项 {@code points.distribution.cron} 覆盖，便于测试。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PointDistributionScheduler {

    private final PointConfigApplicationService pointConfigApplicationService;

    @Scheduled(cron = "${points.distribution.cron:0 0 2 1 * ?}")
    public void distribute() {
        log.info("积分自动发放定时任务开始");
        int success = pointConfigApplicationService.distributePointsToAll();
        log.info("积分自动发放定时任务结束, 成功发放人数={}", success);
    }
}
