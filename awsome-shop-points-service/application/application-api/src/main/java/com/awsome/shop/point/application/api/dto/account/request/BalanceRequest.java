package com.awsome.shop.point.application.api.dto.account.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 查询积分余额请求
 */
@Data
public class BalanceRequest {

    @NotNull(message = "用户ID不能为空")
    private Long userId;
}
