package com.awsome.shop.point.application.impl.service.config;

import com.awsome.shop.point.application.api.dto.config.DistributionConfigDTO;
import com.awsome.shop.point.application.api.dto.config.request.UpdateDistributionConfigRequest;
import com.awsome.shop.point.application.api.service.config.PointConfigApplicationService;
import com.awsome.shop.point.domain.model.config.SystemConfigEntity;
import com.awsome.shop.point.domain.service.account.PointAccountDomainService;
import com.awsome.shop.point.domain.service.config.SystemConfigDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 积分配置应用服务实现
 *
 * <p>负责积分发放配置的读写，以及定时/手动触发的批量自动发放。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PointConfigApplicationServiceImpl implements PointConfigApplicationService {

    /** 每月自动发放积分额度的配置键 */
    public static final String CONFIG_KEY_DISTRIBUTION_AMOUNT = "points.distribution.amount";

    /** 发放额度默认值（BR-POINTS-009） */
    public static final int DEFAULT_DISTRIBUTION_AMOUNT = 100;

    private static final String CONFIG_DESCRIPTION = "每月自动发放积分额度";

    private static final String TRANSACTION_TYPE_DISTRIBUTION = "DISTRIBUTION";

    private final SystemConfigDomainService systemConfigDomainService;
    private final PointAccountDomainService pointAccountDomainService;

    @Override
    public DistributionConfigDTO getDistributionConfig() {
        SystemConfigEntity entity = systemConfigDomainService.getByKey(CONFIG_KEY_DISTRIBUTION_AMOUNT);
        DistributionConfigDTO dto = new DistributionConfigDTO();
        if (entity == null) {
            dto.setAmount(DEFAULT_DISTRIBUTION_AMOUNT);
            dto.setUpdatedAt(null);
        } else {
            dto.setAmount(parseAmount(entity.getConfigValue()));
            dto.setUpdatedAt(entity.getUpdatedAt());
        }
        return dto;
    }

    @Override
    public DistributionConfigDTO updateDistributionConfig(UpdateDistributionConfigRequest request) {
        SystemConfigEntity entity = systemConfigDomainService.setValue(
                CONFIG_KEY_DISTRIBUTION_AMOUNT,
                String.valueOf(request.getAmount()),
                CONFIG_DESCRIPTION);
        DistributionConfigDTO dto = new DistributionConfigDTO();
        dto.setAmount(parseAmount(entity.getConfigValue()));
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    @Override
    public int distributePointsToAll() {
        int amount = parseAmount(
                systemConfigDomainService.getValue(CONFIG_KEY_DISTRIBUTION_AMOUNT,
                        String.valueOf(DEFAULT_DISTRIBUTION_AMOUNT)));

        List<Long> userIds = pointAccountDomainService.listAllUserIds();
        String description = "系统自动发放 - "
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy年MM月"));

        int success = 0;
        int failure = 0;
        for (Long userId : userIds) {
            try {
                // add(...) 本身为独立事务，单条失败不影响其他用户（BR-POINTS-008）
                pointAccountDomainService.add(userId, amount, TRANSACTION_TYPE_DISTRIBUTION, description);
                success++;
            } catch (Exception e) {
                failure++;
                log.error("积分自动发放失败, userId={}, amount={}", userId, amount, e);
            }
        }
        log.info("积分自动发放完成: 总人数={}, 成功={}, 失败={}, 发放额度={}",
                userIds.size(), success, failure, amount);
        return success;
    }

    private int parseAmount(String value) {
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            log.warn("发放配置值非法, value={}, 使用默认值 {}", value, DEFAULT_DISTRIBUTION_AMOUNT);
            return DEFAULT_DISTRIBUTION_AMOUNT;
        }
    }
}
