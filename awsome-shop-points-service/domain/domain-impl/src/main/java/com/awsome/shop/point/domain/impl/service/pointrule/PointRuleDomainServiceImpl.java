package com.awsome.shop.point.domain.impl.service.pointrule;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.common.enums.PointErrorCode;
import com.awsome.shop.point.common.exception.BusinessException;
import com.awsome.shop.point.domain.model.pointrule.PointRuleEntity;
import com.awsome.shop.point.domain.service.pointrule.PointRuleDomainService;
import com.awsome.shop.point.repository.pointrule.PointRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 积分规则领域服务实现
 */
@Service
@RequiredArgsConstructor
public class PointRuleDomainServiceImpl implements PointRuleDomainService {

    private final PointRuleRepository pointRuleRepository;

    @Override
    public PageResult<PointRuleEntity> page(int page, int size, String name, String ruleType, Integer status) {
        return pointRuleRepository.page(page, size, name, ruleType, status);
    }

    @Override
    public PointRuleEntity create(PointRuleEntity entity) {
        return pointRuleRepository.save(entity);
    }

    @Override
    public PointRuleEntity update(PointRuleEntity entity) {
        PointRuleEntity existing = pointRuleRepository.getById(entity.getId());
        if (existing == null) {
            throw new BusinessException(PointErrorCode.RULE_NOT_FOUND);
        }
        if (entity.getName() != null) {
            existing.setName(entity.getName());
        }
        if (entity.getDescription() != null) {
            existing.setDescription(entity.getDescription());
        }
        if (entity.getRuleType() != null) {
            existing.setRuleType(entity.getRuleType());
        }
        if (entity.getPointValueMin() != null) {
            existing.setPointValueMin(entity.getPointValueMin());
        }
        if (entity.getPointValueMax() != null) {
            existing.setPointValueMax(entity.getPointValueMax());
        }
        if (entity.getTriggerCondition() != null) {
            existing.setTriggerCondition(entity.getTriggerCondition());
        }
        if (entity.getStatus() != null) {
            existing.setStatus(entity.getStatus());
        }
        return pointRuleRepository.update(existing);
    }

    @Override
    public PointRuleEntity updateStatus(Long id, Integer status) {
        PointRuleEntity existing = pointRuleRepository.getById(id);
        if (existing == null) {
            throw new BusinessException(PointErrorCode.RULE_NOT_FOUND);
        }
        existing.setStatus(status);
        return pointRuleRepository.update(existing);
    }
}
