package com.awsome.shop.point.domain.service.config;

import com.awsome.shop.point.domain.model.config.SystemConfigEntity;

/**
 * 系统配置领域服务接口
 */
public interface SystemConfigDomainService {

    /** 按键查询配置，不存在返回 null */
    SystemConfigEntity getByKey(String configKey);

    /** 按键查询配置值，不存在返回默认值 */
    String getValue(String configKey, String defaultValue);

    /** 写入配置值（存在则更新，不存在则新增） */
    SystemConfigEntity setValue(String configKey, String configValue, String description);
}
