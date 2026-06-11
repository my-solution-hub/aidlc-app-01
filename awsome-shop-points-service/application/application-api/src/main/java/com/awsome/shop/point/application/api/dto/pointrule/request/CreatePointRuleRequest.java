package com.awsome.shop.point.application.api.dto.pointrule.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 创建积分规则请求
 */
@Data
public class CreatePointRuleRequest {

    @NotBlank(message = "规则名称不能为空")
    private String name;

    private String description;

    @NotBlank(message = "规则类型不能为空")
    private String ruleType;

    @NotNull(message = "积分最小值不能为空")
    private Integer pointValueMin;

    @NotNull(message = "积分最大值不能为空")
    private Integer pointValueMax;

    private String triggerCondition;

    private String scope;

    private String grantMethod;

    private String icon;

    private Integer status = 1;
}
