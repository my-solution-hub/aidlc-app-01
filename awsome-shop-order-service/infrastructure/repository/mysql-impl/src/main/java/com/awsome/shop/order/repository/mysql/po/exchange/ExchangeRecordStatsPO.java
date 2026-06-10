package com.awsome.shop.order.repository.mysql.po.exchange;

import lombok.Data;

/**
 * 积分兑换记录 统计查询结果
 */
@Data
public class ExchangeRecordStatsPO {

    private Long totalCount;
    private Long pendingDeliveryCount;
    private Long completedCount;
    private Long totalPointsConsumed;
}
