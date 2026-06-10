package com.awsome.shop.point.application.impl.service.config;

import com.awsome.shop.point.application.api.dto.config.DistributionConfigDTO;
import com.awsome.shop.point.application.api.dto.config.PointGrantStatsDTO;
import com.awsome.shop.point.application.api.dto.config.request.UpdateDistributionConfigRequest;
import com.awsome.shop.point.application.api.service.config.PointConfigApplicationService;
import com.awsome.shop.point.common.enums.PointErrorCode;
import com.awsome.shop.point.common.exception.BusinessException;
import com.awsome.shop.point.domain.model.account.PointGrantStatsEntity;
import com.awsome.shop.point.domain.model.config.SystemConfigEntity;
import com.awsome.shop.point.domain.service.account.PointAccountDomainService;
import com.awsome.shop.point.domain.service.config.SystemConfigDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 积分配置应用服务实现
 *
 * <p>负责积分发放配置的读写（amount/cycle/grantDay/enabled/targetRole），
 * 发放统计，以及定时/手动触发的批量自动发放。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PointConfigApplicationServiceImpl implements PointConfigApplicationService {

    /** 每月自动发放积分额度的配置键 */
    public static final String CONFIG_KEY_DISTRIBUTION_AMOUNT = "points.distribution.amount";
    public static final String CONFIG_KEY_DISTRIBUTION_CYCLE = "points.distribution.cycle";
    public static final String CONFIG_KEY_DISTRIBUTION_GRANT_DAY = "points.distribution.grantDay";
    public static final String CONFIG_KEY_DISTRIBUTION_ENABLED = "points.distribution.enabled";
    public static final String CONFIG_KEY_DISTRIBUTION_TARGET_ROLE = "points.distribution.targetRole";

    /** 默认值 */
    public static final int DEFAULT_DISTRIBUTION_AMOUNT = 100;
    public static final String DEFAULT_CYCLE = "MONTHLY";
    public static final int DEFAULT_GRANT_DAY = 1;
    public static final boolean DEFAULT_ENABLED = true;
    public static final String DEFAULT_TARGET_ROLE = "employee";

    private static final String DESC_AMOUNT = "每月自动发放积分额度";
    private static final String DESC_CYCLE = "发放周期";
    private static final String DESC_GRANT_DAY = "发放日";
    private static final String DESC_ENABLED = "是否启用自动发放";
    private static final String DESC_TARGET_ROLE = "发放目标角色";

    private static final String TRANSACTION_TYPE_DISTRIBUTION = "DISTRIBUTION";
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final SystemConfigDomainService systemConfigDomainService;
    private final PointAccountDomainService pointAccountDomainService;

    @Override
    public DistributionConfigDTO getDistributionConfig() {
        DistributionConfigDTO dto = new DistributionConfigDTO();
        SystemConfigEntity amountEntity = systemConfigDomainService.getByKey(CONFIG_KEY_DISTRIBUTION_AMOUNT);
        dto.setAmount(amountEntity == null
                ? DEFAULT_DISTRIBUTION_AMOUNT : parseAmount(amountEntity.getConfigValue()));
        dto.setCycle(getStringValue(CONFIG_KEY_DISTRIBUTION_CYCLE, DEFAULT_CYCLE));
        dto.setGrantDay(parseInt(
                getStringValue(CONFIG_KEY_DISTRIBUTION_GRANT_DAY, String.valueOf(DEFAULT_GRANT_DAY)),
                DEFAULT_GRANT_DAY));
        dto.setEnabled(Boolean.parseBoolean(
                getStringValue(CONFIG_KEY_DISTRIBUTION_ENABLED, String.valueOf(DEFAULT_ENABLED))));
        dto.setTargetRole(getStringValue(CONFIG_KEY_DISTRIBUTION_TARGET_ROLE, DEFAULT_TARGET_ROLE));
        dto.setUpdatedAt(amountEntity == null ? null : amountEntity.getUpdatedAt());
        return dto;
    }

    @Override
    public DistributionConfigDTO updateDistributionConfig(UpdateDistributionConfigRequest request) {
        int amount = request.getAmount() == null ? 0 : request.getAmount();
        int grantDay = request.getGrantDay() == null ? DEFAULT_GRANT_DAY : request.getGrantDay();
        if (amount <= 0 || grantDay < 1 || grantDay > 28) {
            throw new BusinessException(PointErrorCode.POINT_CONFIG_INVALID);
        }
        String cycle = request.getCycle() == null ? DEFAULT_CYCLE : request.getCycle();
        boolean enabled = request.getEnabled() == null ? DEFAULT_ENABLED : request.getEnabled();
        String targetRole = request.getTargetRole() == null ? DEFAULT_TARGET_ROLE : request.getTargetRole();

        SystemConfigEntity amountEntity = systemConfigDomainService.setValue(
                CONFIG_KEY_DISTRIBUTION_AMOUNT, String.valueOf(amount), DESC_AMOUNT);
        systemConfigDomainService.setValue(CONFIG_KEY_DISTRIBUTION_CYCLE, cycle, DESC_CYCLE);
        systemConfigDomainService.setValue(
                CONFIG_KEY_DISTRIBUTION_GRANT_DAY, String.valueOf(grantDay), DESC_GRANT_DAY);
        systemConfigDomainService.setValue(
                CONFIG_KEY_DISTRIBUTION_ENABLED, String.valueOf(enabled), DESC_ENABLED);
        systemConfigDomainService.setValue(
                CONFIG_KEY_DISTRIBUTION_TARGET_ROLE, targetRole, DESC_TARGET_ROLE);

        DistributionConfigDTO dto = new DistributionConfigDTO();
        dto.setAmount(amount);
        dto.setCycle(cycle);
        dto.setGrantDay(grantDay);
        dto.setEnabled(enabled);
        dto.setTargetRole(targetRole);
        dto.setUpdatedAt(amountEntity.getUpdatedAt());
        return dto;
    }

    @Override
    public PointGrantStatsDTO getDistributionStats(String month) {
        YearMonth ym = parseMonth(month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();
        PointGrantStatsEntity entity = pointAccountDomainService.statDistribution(start, end);

        PointGrantStatsDTO dto = new PointGrantStatsDTO();
        dto.setMonth(ym.format(MONTH_FORMATTER));
        dto.setGrantedTotal(entity.getGrantedTotal());
        dto.setCoveredEmployees(entity.getCoveredEmployees());
        dto.setLastGrantedAt(entity.getLastGrantedAt());
        return dto;
    }

    @Override
    public int distributePointsToAll() {
        boolean enabled = Boolean.parseBoolean(
                getStringValue(CONFIG_KEY_DISTRIBUTION_ENABLED, String.valueOf(DEFAULT_ENABLED)));
        if (!enabled) {
            log.info("积分自动发放已禁用，跳过本次发放");
            return 0;
        }

        int amount = parseAmount(
                systemConfigDomainService.getValue(CONFIG_KEY_DISTRIBUTION_AMOUNT,
                        String.valueOf(DEFAULT_DISTRIBUTION_AMOUNT)));

        List<Long> userIds = pointAccountDomainService.listAllUserIds();
        String description = "系统自动发放 - "
                + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy年MM月"));

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

    private String getStringValue(String key, String defaultValue) {
        return systemConfigDomainService.getValue(key, defaultValue);
    }

    private int parseAmount(String value) {
        return parseInt(value, DEFAULT_DISTRIBUTION_AMOUNT);
    }

    private int parseInt(String value, int defaultValue) {
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException | NullPointerException e) {
            log.warn("配置值非法, value={}, 使用默认值 {}", value, defaultValue);
            return defaultValue;
        }
    }

    private YearMonth parseMonth(String month) {
        if (month == null || month.isBlank()) {
            return YearMonth.now();
        }
        try {
            return YearMonth.parse(month.trim(), MONTH_FORMATTER);
        } catch (Exception e) {
            throw new BusinessException(PointErrorCode.POINT_CONFIG_INVALID, "月份格式非法，应为 YYYY-MM");
        }
    }
}
