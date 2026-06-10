package com.awsome.shop.point.repository.mysql.impl.config;

import com.awsome.shop.point.domain.model.config.SystemConfigEntity;
import com.awsome.shop.point.repository.config.SystemConfigRepository;
import com.awsome.shop.point.repository.mysql.mapper.config.SystemConfigMapper;
import com.awsome.shop.point.repository.mysql.po.config.SystemConfigPO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/**
 * 系统配置仓储实现（Adapter）
 */
@Repository
@RequiredArgsConstructor
public class SystemConfigRepositoryImpl implements SystemConfigRepository {

    private final SystemConfigMapper systemConfigMapper;

    @Override
    public SystemConfigEntity findByKey(String configKey) {
        SystemConfigPO po = systemConfigMapper.selectByConfigKey(configKey);
        return po == null ? null : toEntity(po);
    }

    @Override
    public SystemConfigEntity save(SystemConfigEntity entity) {
        SystemConfigPO po = toPO(entity);
        systemConfigMapper.insert(po);
        return toEntity(systemConfigMapper.selectById(po.getId()));
    }

    @Override
    public SystemConfigEntity update(SystemConfigEntity entity) {
        SystemConfigPO po = toPO(entity);
        systemConfigMapper.updateById(po);
        return toEntity(systemConfigMapper.selectById(po.getId()));
    }

    private SystemConfigPO toPO(SystemConfigEntity entity) {
        SystemConfigPO po = new SystemConfigPO();
        po.setId(entity.getId());
        po.setConfigKey(entity.getConfigKey());
        po.setConfigValue(entity.getConfigValue());
        po.setDescription(entity.getDescription());
        return po;
    }

    private SystemConfigEntity toEntity(SystemConfigPO po) {
        SystemConfigEntity entity = new SystemConfigEntity();
        entity.setId(po.getId());
        entity.setConfigKey(po.getConfigKey());
        entity.setConfigValue(po.getConfigValue());
        entity.setDescription(po.getDescription());
        entity.setCreatedAt(po.getCreatedAt());
        entity.setUpdatedAt(po.getUpdatedAt());
        return entity;
    }
}
