package com.awsome.shop.order.domain.model.exchange;

import lombok.Data;

/**
 * 积分兑换记录 统计值对象
 */
@Data
public class ExchangeRecordStatsEntity {

    private Long totalCount;
    private Long pendingDeliveryCount;
    private Long completedCount;
    private Long totalPointsConsumed;
}
