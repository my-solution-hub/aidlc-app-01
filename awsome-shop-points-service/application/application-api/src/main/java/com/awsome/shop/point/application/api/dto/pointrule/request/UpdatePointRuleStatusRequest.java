package com.awsome.shop.point.application.api.dto.pointrule.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新积分规则状态请求
 */
@Data
public class UpdatePointRuleStatusRequest {

    @NotNull(message = "ID不能为空")
    private Long id;

    @NotNull(message = "状态不能为空")
    private Integer status;
}
