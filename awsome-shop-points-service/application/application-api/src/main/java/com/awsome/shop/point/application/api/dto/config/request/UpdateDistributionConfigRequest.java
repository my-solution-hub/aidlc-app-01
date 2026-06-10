package com.awsome.shop.point.application.api.dto.config.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新积分发放配置请求（完整发放配置 US-022）
 *
 * <p>amount/grantDay 的范围校验在应用服务中执行，违反时返回 POINT_CONFIG_INVALID。</p>
 */
@Data
public class UpdateDistributionConfigRequest {

    @NotNull(message = "发放额度不能为空")
    private Integer amount;

    /** 发放周期，默认 MONTHLY */
    private String cycle = "MONTHLY";

    /** 发放日（1-28），默认 1 */
    private Integer grantDay = 1;

    /** 是否启用，默认 true */
    private Boolean enabled = true;

    /** 发放目标角色，默认 employee */
    private String targetRole = "employee";
}
