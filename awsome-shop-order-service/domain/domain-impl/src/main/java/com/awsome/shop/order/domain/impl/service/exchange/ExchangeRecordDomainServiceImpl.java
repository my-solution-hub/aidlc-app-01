package com.awsome.shop.order.domain.impl.service.exchange;

import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.common.enums.OrderErrorCode;
import com.awsome.shop.order.common.enums.SampleErrorCode;
import com.awsome.shop.order.common.exception.BusinessException;
import com.awsome.shop.order.domain.model.exchange.ExchangeRecordEntity;
import com.awsome.shop.order.domain.model.exchange.ExchangeRecordStatsEntity;
import com.awsome.shop.order.domain.model.exchange.ExchangeStatusLogEntity;
import java.util.List;
import com.awsome.shop.order.domain.service.exchange.ExchangeRecordDomainService;
import com.awsome.shop.order.repository.exchange.ExchangeRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

/**
 * 积分兑换记录 领域服务实现
 */
@Service
@RequiredArgsConstructor
public class ExchangeRecordDomainServiceImpl implements ExchangeRecordDomainService {

    private static final Set<String> ALLOWED_STATUSES =
            Set.of("PENDING_DELIVERY", "DELIVERING", "COMPLETED", "CANCELLED");

    /**
     * 状态流转图（BR-ORDER-006）。仅允许前进，不可回退/跳转：
     * PENDING_DELIVERY → DELIVERING | CANCELLED
     * DELIVERING       → COMPLETED  | CANCELLED
     * 对应规格 PENDING/READY/COMPLETED/CANCELLED。
     */
    private static final Map<String, Set<String>> STATUS_TRANSITIONS = Map.of(
            "PENDING_DELIVERY", Set.of("DELIVERING", "CANCELLED"),
            "DELIVERING", Set.of("COMPLETED", "CANCELLED"),
            "COMPLETED", Set.of(),
            "CANCELLED", Set.of());

    private final ExchangeRecordRepository exchangeRecordRepository;

    @Override
    public ExchangeRecordEntity getById(Long id) {
        ExchangeRecordEntity entity = exchangeRecordRepository.getById(id);
        if (entity == null) {
            throw new BusinessException(SampleErrorCode.RESOURCE_NOT_FOUND);
        }
        return entity;
    }

    @Override
    public PageResult<ExchangeRecordEntity> page(int page, int size, String keyword, String status,
                                                  LocalDateTime startTime, LocalDateTime endTime) {
        return exchangeRecordRepository.page(page, size, keyword, status, startTime, endTime);
    }

    @Override
    public PageResult<ExchangeRecordEntity> pageByUser(int page, int size, Long userId, String status, String keyword) {
        return exchangeRecordRepository.pageByUser(page, size, userId, status, keyword);
    }

    @Override
    public ExchangeRecordStatsEntity stats() {
        return exchangeRecordRepository.stats();
    }

    @Override
    public ExchangeRecordEntity save(ExchangeRecordEntity entity) {
        return exchangeRecordRepository.save(entity);
    }

    @Override
    public void updateStatus(Long id, String status) {
        exchangeRecordRepository.updateStatus(id, status);
    }

    @Override
    public ExchangeRecordEntity updateStatus(Long id, String status, String trackingNumber, String carrier) {
        if (!ALLOWED_STATUSES.contains(status)) {
            throw new BusinessException(OrderErrorCode.INVALID_EXCHANGE_STATUS, status);
        }
        ExchangeRecordEntity entity = getById(id);
        // 状态流转校验（BR-ORDER-006）：仅允许合法的状态变更
        String current = entity.getStatus();
        if (!status.equals(current)) {
            Set<String> allowedNext = STATUS_TRANSITIONS.getOrDefault(current, Set.of());
            if (!allowedNext.contains(status)) {
                throw new BusinessException(OrderErrorCode.INVALID_EXCHANGE_STATUS,
                        current + " → " + status);
            }
        }
        exchangeRecordRepository.updateStatus(id, status, trackingNumber, carrier);
        entity.setStatus(status);
        if (trackingNumber != null) {
            entity.setTrackingNumber(trackingNumber);
        }
        if (carrier != null) {
            entity.setCarrier(carrier);
        }
        return entity;
    }

    @Override
    public void addStatusLog(Long exchangeId, String status, String remark) {
        exchangeRecordRepository.addStatusLog(exchangeId, status, remark);
    }

    @Override
    public List<ExchangeStatusLogEntity> listStatusLog(Long exchangeId) {
        return exchangeRecordRepository.listStatusLog(exchangeId);
    }
}
