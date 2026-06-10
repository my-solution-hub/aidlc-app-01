package com.awsome.shop.point.repository.config;

import com.awsome.shop.point.domain.model.config.SystemConfigEntity;

/**
 * 系统配置仓储接口（Port）
 */
public interface SystemConfigRepository {

    /** 按配置键查询，不存在返回 null */
    SystemConfigEntity findByKey(String configKey);

    /** 新增配置 */
    SystemConfigEntity save(SystemConfigEntity entity);

    /** 更新配置 */
    SystemConfigEntity update(SystemConfigEntity entity);
}
