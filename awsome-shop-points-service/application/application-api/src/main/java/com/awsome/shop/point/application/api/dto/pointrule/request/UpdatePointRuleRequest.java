package com.awsome.shop.point.application.api.dto.pointrule.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新积分规则请求
 */
@Data
public class UpdatePointRuleRequest {

    @NotNull(message = "ID不能为空")
    private Long id;

    private String name;

    private String description;

    private String ruleType;

    private Integer pointValueMin;

    private Integer pointValueMax;

    private String triggerCondition;

    private Integer status;
}
