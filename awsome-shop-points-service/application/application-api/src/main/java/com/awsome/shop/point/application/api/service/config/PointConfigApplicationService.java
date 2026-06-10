package com.awsome.shop.point.application.api.service.config;

import com.awsome.shop.point.application.api.dto.config.DistributionConfigDTO;
import com.awsome.shop.point.application.api.dto.config.PointGrantStatsDTO;
import com.awsome.shop.point.application.api.dto.config.request.UpdateDistributionConfigRequest;

/**
 * 积分配置应用服务接口
 */
public interface PointConfigApplicationService {

    /** 获取积分发放配置（不存在则返回默认值） */
    DistributionConfigDTO getDistributionConfig();

    /** 更新积分发放配置 */
    DistributionConfigDTO updateDistributionConfig(UpdateDistributionConfigRequest request);

    /**
     * 获取积分发放统计（US-022）。
     *
     * @param month 统计月份（YYYY-MM），为 null 时使用当前月
     */
    PointGrantStatsDTO getDistributionStats(String month);

    /**
     * 执行积分自动发放：为所有已有账户发放配置额度。
     *
     * <p>逐用户独立事务，单条失败不影响其他用户（BR-POINTS-008）。</p>
     *
     * @return 实际成功发放的用户数
     */
    int distributePointsToAll();
}
