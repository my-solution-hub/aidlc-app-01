package com.awsome.shop.point.domain.service.pointrule;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.pointrule.PointRuleEntity;

/**
 * 积分规则领域服务接口
 */
public interface PointRuleDomainService {

    PageResult<PointRuleEntity> page(int page, int size, String name, String ruleType, Integer status);

    PointRuleEntity create(PointRuleEntity entity);

    PointRuleEntity update(PointRuleEntity entity);

    PointRuleEntity updateStatus(Long id, Integer status);
}
