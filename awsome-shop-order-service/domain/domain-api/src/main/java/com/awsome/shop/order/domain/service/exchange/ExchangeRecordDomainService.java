package com.awsome.shop.order.domain.service.exchange;

import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.domain.model.exchange.ExchangeRecordEntity;
import com.awsome.shop.order.domain.model.exchange.ExchangeRecordStatsEntity;
import com.awsome.shop.order.domain.model.exchange.ExchangeStatusLogEntity;
import java.util.List;

import java.time.LocalDateTime;

/**
 * 积分兑换记录 领域服务接口
 */
public interface ExchangeRecordDomainService {

    ExchangeRecordEntity getById(Long id);

    PageResult<ExchangeRecordEntity> page(int page, int size, String keyword, String status,
                                          LocalDateTime startTime, LocalDateTime endTime);

    PageResult<ExchangeRecordEntity> pageByUser(int page, int size, Long userId, String status, String keyword);

    ExchangeRecordStatsEntity stats();

    /**
     * 保存兑换记录，返回带主键的实体
     */
    ExchangeRecordEntity save(ExchangeRecordEntity entity);

    /**
     * 更新兑换记录状态
     */
    void updateStatus(Long id, String status);

    /**
     * 更新兑换记录状态及物流单号，返回更新后的实体
     *
     * <p>校验 status 必须为合法状态值，trackingNumber 为空时不更新该字段</p>
     */
    ExchangeRecordEntity updateStatus(Long id, String status, String trackingNumber, String carrier);

    void addStatusLog(Long exchangeId, String status, String remark);

    List<ExchangeStatusLogEntity> listStatusLog(Long exchangeId);
}
