package com.awsome.shop.order.repository.exchange;

import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.domain.model.exchange.ExchangeRecordEntity;
import com.awsome.shop.order.domain.model.exchange.ExchangeRecordStatsEntity;

import java.time.LocalDateTime;

/**
 * 积分兑换记录 仓储接口
 */
public interface ExchangeRecordRepository {

    ExchangeRecordEntity getById(Long id);

    PageResult<ExchangeRecordEntity> page(int page, int size, String keyword, String status,
                                          LocalDateTime startTime, LocalDateTime endTime);

    PageResult<ExchangeRecordEntity> pageByUser(int page, int size, Long userId, String status);

    ExchangeRecordStatsEntity stats();

    /**
     * 保存兑换记录，返回带自增主键的实体
     */
    ExchangeRecordEntity save(ExchangeRecordEntity entity);

    /**
     * 更新兑换记录状态
     */
    void updateStatus(Long id, String status);

    /**
     * 更新兑换记录状态及物流单号（trackingNumber 为空时不更新该字段）
     */
    void updateStatus(Long id, String status, String trackingNumber);
}
