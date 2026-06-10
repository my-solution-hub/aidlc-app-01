package com.awsome.shop.order.application.api.dto.exchange;

import lombok.Data;

/**
 * 积分兑换记录 统计数据传输对象
 */
@Data
public class ExchangeRecordStatsDTO {

    private Long totalCount;
    private Long pendingDeliveryCount;
    private Long completedCount;
    private Long totalPointsConsumed;
}
