package com.awsome.shop.point.domain.model.pointrule;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分规则领域实体
 */
@Data
public class PointRuleEntity {

    private Long id;

    private String name;

    private String description;

    private String ruleType;

    private Integer pointValueMin;

    private Integer pointValueMax;

    private String triggerCondition;

    private Integer status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
