package com.awsome.shop.point.repository.pointrule;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.pointrule.PointRuleEntity;

/**
 * 积分规则仓储接口
 */
public interface PointRuleRepository {

    PageResult<PointRuleEntity> page(int page, int size, String name, String ruleType, Integer status);

    PointRuleEntity getById(Long id);

    PointRuleEntity save(PointRuleEntity entity);

    PointRuleEntity update(PointRuleEntity entity);
}
