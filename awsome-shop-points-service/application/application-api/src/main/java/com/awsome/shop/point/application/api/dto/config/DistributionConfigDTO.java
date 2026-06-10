package com.awsome.shop.point.application.api.dto.config;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分发放配置 DTO
 */
@Data
public class DistributionConfigDTO {

    /** 每月发放额度 */
    private Integer amount;

    /** 最后更新时间 */
    private LocalDateTime updatedAt;
}
