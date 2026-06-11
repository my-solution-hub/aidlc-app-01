package com.awsome.shop.order.application.impl.service.exchange;

import com.awsome.shop.order.application.api.dto.exchange.ExchangeRecordDTO;
import com.awsome.shop.order.application.api.dto.exchange.StatusLogDTO;
import com.awsome.shop.order.application.api.dto.exchange.ExchangeRecordStatsDTO;
import com.awsome.shop.order.application.api.dto.exchange.request.ExchangeRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.GetExchangeRecordRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.ListExchangeRecordRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.ListMyExchangeRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.UpdateExchangeStatusRequest;
import com.awsome.shop.order.application.api.service.exchange.ExchangeRecordApplicationService;
import com.awsome.shop.order.application.impl.saga.ExchangeRemoteClient;
import com.awsome.shop.order.application.impl.saga.SagaException;
import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.common.enums.OrderErrorCode;
import com.awsome.shop.order.common.exception.BusinessException;
import com.awsome.shop.order.domain.model.exchange.ExchangeRecordEntity;
import com.awsome.shop.order.domain.model.exchange.ExchangeRecordStatsEntity;
import com.awsome.shop.order.domain.service.exchange.ExchangeRecordDomainService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 积分兑换记录 应用服务实现
 *
 * <p>只依赖 Domain Service，不直接依赖 Repository</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeRecordApplicationServiceImpl implements ExchangeRecordApplicationService {

    private static final String STATUS_PENDING_DELIVERY = "PENDING_DELIVERY";

    private final ExchangeRecordDomainService exchangeRecordDomainService;
    private final ExchangeRemoteClient exchangeRemoteClient;
    private final IdempotencyService idempotencyService;
    private final ExchangeRateLimitService rateLimitService;
    private final ExchangeNotificationService notificationService;
    private final com.awsome.shop.order.domain.service.address.AddressDomainService addressDomainService;

    @Override
    public ExchangeRecordDTO get(GetExchangeRecordRequest request) {
        ExchangeRecordDTO dto = toDTO(exchangeRecordDomainService.getById(request.getId()));
        // 填充状态时间线
        java.util.List<StatusLogDTO> timeline = exchangeRecordDomainService
                .listStatusLog(request.getId()).stream().map(log -> {
                    StatusLogDTO s = new StatusLogDTO();
                    s.setStatus(log.getStatus());
                    s.setRemark(log.getRemark());
                    s.setTime(log.getCreatedAt());
                    return s;
                }).collect(java.util.stream.Collectors.toList());
        dto.setTimeline(timeline);
        return dto;
    }

    @Override
    public PageResult<ExchangeRecordDTO> list(ListExchangeRecordRequest request) {
        PageResult<ExchangeRecordEntity> page = exchangeRecordDomainService.page(
                request.getPage(), request.getSize(),
                request.getKeyword(), request.getStatus(),
                request.getStartTime(), request.getEndTime());
        return page.convert(this::toDTO);
    }

    @Override
    public ExchangeRecordStatsDTO stats() {
        ExchangeRecordStatsEntity entity = exchangeRecordDomainService.stats();
        ExchangeRecordStatsDTO dto = new ExchangeRecordStatsDTO();
        dto.setTotalCount(entity.getTotalCount());
        dto.setPendingDeliveryCount(entity.getPendingDeliveryCount());
        dto.setCompletedCount(entity.getCompletedCount());
        dto.setTotalPointsConsumed(entity.getTotalPointsConsumed());
        return dto;
    }

    @Override
    public ExchangeRecordDTO updateStatus(UpdateExchangeStatusRequest request) {
        // 取消前读取原记录，用于退款补偿（BR-ORDER-007）
        ExchangeRecordEntity before = exchangeRecordDomainService.getById(request.getId());
        boolean cancelling = "CANCELLED".equals(request.getStatus())
                && !"CANCELLED".equals(before.getStatus());

        ExchangeRecordEntity updated = exchangeRecordDomainService.updateStatus(
                request.getId(), request.getStatus(), request.getTrackingNumber(), request.getCarrier());

        // 取消时自动退还积分 + 恢复库存（BR-ORDER-007）。
        // 状态已更新；补偿失败仅记录日志，需人工介入，不回滚状态。
        if (cancelling) {
            safeRefundPoints(before.getUserId(), before.getPointsCost());
            int qty = before.getQuantity() == null ? 1 : before.getQuantity();
            safeRestoreStock(before.getProductId(), qty);
        }
        safeAddStatusLog(updated.getId(), updated.getStatus(), "状态更新为 " + updated.getStatus());
        // ORD-8: 状态变更通知
        notificationService.notifyStatusChange(updated.getUserId(), updated.getOrderNo(), updated.getStatus());
        return toDTO(updated);
    }

    @Override
    public ExchangeRecordDTO exchange(ExchangeRequest request) {
        int quantity = request.getQuantity() == null ? 1 : request.getQuantity();
        Long productId = request.getProductId();
        Long userId = request.getUserId();

        // ORD-5: 幂等性检查
        String idempotencyKey = request.getIdempotencyKey();
        if (!idempotencyService.tryAcquire(idempotencyKey)) {
            throw new BusinessException(OrderErrorCode.DUPLICATE_EXCHANGE_REQUEST);
        }

        // ORD-6: 频率限制
        if (!rateLimitService.allowExchange(userId)) {
            idempotencyService.release(idempotencyKey);
            throw new BusinessException(OrderErrorCode.EXCHANGE_RATE_LIMITED);
        }

        // 0. 查询商品信息（积分单价 + 名称等）
        JsonNode product;
        try {
            product = exchangeRemoteClient.getProduct(productId);
        } catch (SagaException e) {
            idempotencyService.release(idempotencyKey);
            throw e;
        }
        String productName = product.path("name").asText("");
        int pointsPrice = product.path("pointsPrice").asInt(0);
        String imageUrl = product.path("imageUrl").asText(null);
        String description = product.path("description").asText(null);
        int pointsCost = pointsPrice * quantity;

        // Saga 执行顺序：先扣积分，再扣库存（BR-ORDER-003）。
        // 原因：积分是虚拟资产，回滚更安全可靠；库存扣减失败时回滚积分。
        Integer balanceAfter = null;
        try {
            // 1. 扣减积分（返回扣减后余额，用于记录 balanceAfter）
            balanceAfter = exchangeRemoteClient.deductPoints(userId, pointsCost);
        } catch (SagaException e) {
            // 步骤1（扣减积分）失败，无需补偿
            throw new BusinessException(OrderErrorCode.DEDUCT_POINTS_FAILED, e.getMessage());
        }

        try {
            // 2. 扣减库存
            exchangeRemoteClient.deductStock(productId, quantity);
        } catch (SagaException e) {
            // 补偿：退还积分
            safeRefundPoints(userId, pointsCost);
            throw new BusinessException(OrderErrorCode.DEDUCT_STOCK_FAILED, e.getMessage());
        }

        // 3. 持久化兑换记录
        ExchangeRecordEntity entity = buildEntity(request, productId, productName,
                description, imageUrl, quantity, pointsCost);
        entity.setFreightPoints(0);
        entity.setBalanceAfter(balanceAfter);
        // 填充收货地址快照(若下单携带 addressId)
        if (request.getAddressId() != null) {
            try {
                com.awsome.shop.order.domain.model.address.AddressEntity addr =
                        addressDomainService.list(userId).stream()
                                .filter(a -> a.getId().equals(request.getAddressId()))
                                .findFirst().orElse(null);
                if (addr != null) {
                    entity.setReceiver(addr.getReceiver());
                    entity.setReceiverPhone(addr.getPhone());
                    entity.setReceiverAddress((addr.getRegion() == null ? "" : addr.getRegion() + " ") + addr.getDetail());
                }
            } catch (Exception ex) {
                log.warn("填充收货地址快照失败, addressId={}", request.getAddressId(), ex);
            }
        }
        try {
            ExchangeRecordEntity saved = exchangeRecordDomainService.save(entity);
            safeAddStatusLog(saved.getId(), "PENDING_DELIVERY", "订单提交成功，积分已扣除");
            // ORD-8: 兑换成功通知
            notificationService.notifyExchangeSuccess(userId, saved.getOrderNo(), productName);
            return toDTO(saved);
        } catch (Exception e) {
            // 补偿：退还积分 + 恢复库存
            safeRefundPoints(userId, pointsCost);
            safeRestoreStock(productId, quantity);
            log.error("兑换记录持久化失败, productId={}, userId={}", productId, userId, e);
            throw new BusinessException(OrderErrorCode.EXCHANGE_PERSIST_FAILED, e);
        }
    }

    @Override
    public PageResult<ExchangeRecordDTO> listMine(ListMyExchangeRequest request) {
        PageResult<ExchangeRecordEntity> page = exchangeRecordDomainService.pageByUser(
                request.getPage(), request.getSize(), request.getUserId(),
                request.getStatus(), request.getKeyword());
        return page.convert(this::toDTO);
    }

    @Override
    public ExchangeRecordDTO confirmReceipt(Long id, Long userId) {
        // 校验订单归属(仅本人可确认收货)
        ExchangeRecordEntity record = exchangeRecordDomainService.getById(id);
        if (userId != null && !userId.equals(record.getUserId())) {
            throw new BusinessException(OrderErrorCode.INVALID_EXCHANGE_STATUS, "无权操作他人订单");
        }
        // 流转到 COMPLETED(domain 会校验 DELIVERING -> COMPLETED 合法性)
        ExchangeRecordEntity updated = exchangeRecordDomainService.updateStatus(
                id, "COMPLETED", record.getTrackingNumber(), record.getCarrier());
        safeAddStatusLog(id, "COMPLETED", "员工已确认收货");
        notificationService.notifyStatusChange(updated.getUserId(), updated.getOrderNo(), updated.getStatus());
        return toDTO(updated);
    }

    private ExchangeRecordEntity buildEntity(ExchangeRequest request, Long productId, String productName,
                                             String productDesc, String imageUrl, int quantity, int pointsCost) {
        ExchangeRecordEntity entity = new ExchangeRecordEntity();
        entity.setOrderNo("EX" + System.currentTimeMillis());
        entity.setProductId(productId);
        entity.setProductName(productName);
        entity.setProductDesc(productDesc);
        entity.setProductImageUrl(imageUrl);
        entity.setUserId(request.getUserId());
        entity.setEmployeeName(request.getEmployeeName());
        entity.setQuantity(quantity);
        entity.setPointsCost(pointsCost);
        entity.setExchangeTime(LocalDateTime.now());
        entity.setStatus(STATUS_PENDING_DELIVERY);
        return entity;
    }

    private void safeRestoreStock(Long productId, int quantity) {
        try {
            exchangeRemoteClient.restoreStock(productId, quantity);
        } catch (Exception ex) {
            log.error("库存补偿失败, productId={}, quantity={}", productId, quantity, ex);
        }
    }

    private void safeRefundPoints(Long userId, int amount) {
        try {
            exchangeRemoteClient.refundPoints(userId, amount);
        } catch (Exception ex) {
            log.error("积分补偿失败, userId={}, amount={}", userId, amount, ex);
        }
    }

    /**
     * 记录状态日志（容错）。时间线是辅助展示数据，写入失败仅告警，
     * 不影响主交易（订单/积分/库存已完成），避免次要数据拖垮核心流程。
     */
    private void safeAddStatusLog(Long exchangeId, String status, String remark) {
        try {
            exchangeRecordDomainService.addStatusLog(exchangeId, status, remark);
        } catch (Exception ex) {
            log.warn("状态日志写入失败(不影响主流程), exchangeId={}, status={}", exchangeId, status, ex);
        }
    }

    private ExchangeRecordDTO toDTO(ExchangeRecordEntity entity) {
        ExchangeRecordDTO dto = new ExchangeRecordDTO();
        dto.setId(entity.getId());
        dto.setOrderNo(entity.getOrderNo());
        dto.setProductId(entity.getProductId());
        dto.setProductName(entity.getProductName());
        dto.setProductDesc(entity.getProductDesc());
        dto.setProductImageUrl(entity.getProductImageUrl());
        dto.setUserId(entity.getUserId());
        dto.setEmployeeName(entity.getEmployeeName());
        dto.setQuantity(entity.getQuantity());
        dto.setPointsCost(entity.getPointsCost());
        dto.setFreightPoints(entity.getFreightPoints());
        dto.setBalanceAfter(entity.getBalanceAfter());
        dto.setExchangeTime(entity.getExchangeTime());
        dto.setStatus(entity.getStatus());
        dto.setTrackingNumber(entity.getTrackingNumber());
        dto.setCarrier(entity.getCarrier());
        dto.setReceiver(entity.getReceiver());
        dto.setReceiverPhone(entity.getReceiverPhone());
        dto.setReceiverAddress(entity.getReceiverAddress());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
