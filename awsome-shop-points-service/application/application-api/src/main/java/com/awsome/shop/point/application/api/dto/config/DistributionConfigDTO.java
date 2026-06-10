package com.awsome.shop.point.application.api.dto.config;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分发放配置 DTO（完整发放配置 US-022）
 */
@Data
public class DistributionConfigDTO {

    /** 每月发放额度 */
    private Integer amount;

    /** 发放周期，默认 MONTHLY */
    private String cycle;

    /** 发放日（1-28），默认 1 */
    private Integer grantDay;

    /** 是否启用自动发放，默认 true */
    private Boolean enabled;

    /** 发放目标角色，默认 employee */
    private String targetRole;

    /** 最后更新时间 */
    private LocalDateTime updatedAt;
}
