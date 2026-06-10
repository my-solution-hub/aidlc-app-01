package com.awsome.shop.point.application.api.dto.pointrule;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分规则数据传输对象
 */
@Data
public class PointRuleDTO {

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
