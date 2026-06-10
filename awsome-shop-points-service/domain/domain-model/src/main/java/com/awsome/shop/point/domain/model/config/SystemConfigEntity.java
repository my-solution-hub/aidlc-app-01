package com.awsome.shop.point.domain.model.config;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 系统配置领域实体
 */
@Data
public class SystemConfigEntity {

    private Long id;

    /** 配置键（唯一） */
    private String configKey;

    /** 配置值 */
    private String configValue;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
