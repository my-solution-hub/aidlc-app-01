package com.awsome.shop.order.application.api.dto.exchange.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 获取积分兑换记录详情请求
 */
@Data
public class GetExchangeRecordRequest {

    @NotNull(message = "ID不能为空")
    private Long id;
}
