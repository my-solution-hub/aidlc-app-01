package com.awsome.shop.point.application.api.dto.config.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新积分发放配置请求
 */
@Data
public class UpdateDistributionConfigRequest {

    @NotNull(message = "发放额度不能为空")
    @Min(value = 1, message = "发放额度必须大于0")
    private Integer amount;
}
