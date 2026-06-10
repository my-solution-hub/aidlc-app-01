package com.awsome.shop.point.bootstrap.scheduler;

import com.awsome.shop.point.application.api.service.config.PointConfigApplicationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

/**
 * P0-PTS-1: 积分定期自动发放 — 调度器单元测试
 */
@ExtendWith(MockitoExtension.class)
class PointDistributionSchedulerTest {

    @Mock
    private PointConfigApplicationService pointConfigApplicationService;

    @InjectMocks
    private PointDistributionScheduler scheduler;

    @Test
    @DisplayName("定时发放 - 调用 distributePointsToAll")
    void distribute_callsDistributePointsToAll() {
        // given
        when(pointConfigApplicationService.distributePointsToAll()).thenReturn(50);

        // when
        scheduler.distribute();

        // then
        verify(pointConfigApplicationService, times(1)).distributePointsToAll();
    }

    @Test
    @DisplayName("定时发放 - 发放人数为0时不报错")
    void distribute_zeroUsers_noException() {
        // given
        when(pointConfigApplicationService.distributePointsToAll()).thenReturn(0);

        // when & then - 不应抛异常
        scheduler.distribute();
        verify(pointConfigApplicationService).distributePointsToAll();
    }

    @Test
    @DisplayName("定时发放 - 内部异常应向上传播（让调度框架记录错误）")
    void distribute_internalException_propagates() {
        // given
        when(pointConfigApplicationService.distributePointsToAll())
                .thenThrow(new RuntimeException("DB connection failed"));

        // when & then
        org.junit.jupiter.api.Assertions.assertThrows(RuntimeException.class, () -> scheduler.distribute());
    }
}
