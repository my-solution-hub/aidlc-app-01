package com.awsome.shop.point.domain.impl.service.config;

import com.awsome.shop.point.domain.model.config.SystemConfigEntity;
import com.awsome.shop.point.domain.service.config.SystemConfigDomainService;
import com.awsome.shop.point.repository.config.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 系统配置领域服务实现
 */
@Service
@RequiredArgsConstructor
public class SystemConfigDomainServiceImpl implements SystemConfigDomainService {

    private final SystemConfigRepository repository;

    @Override
    public SystemConfigEntity getByKey(String configKey) {
        return repository.findByKey(configKey);
    }

    @Override
    public String getValue(String configKey, String defaultValue) {
        SystemConfigEntity entity = repository.findByKey(configKey);
        return entity == null ? defaultValue : entity.getConfigValue();
    }

    @Override
    @Transactional
    public SystemConfigEntity setValue(String configKey, String configValue, String description) {
        SystemConfigEntity existing = repository.findByKey(configKey);
        if (existing == null) {
            SystemConfigEntity entity = new SystemConfigEntity();
            entity.setConfigKey(configKey);
            entity.setConfigValue(configValue);
            entity.setDescription(description);
            return repository.save(entity);
        }
        existing.setConfigValue(configValue);
        if (description != null) {
            existing.setDescription(description);
        }
        return repository.update(existing);
    }
}
