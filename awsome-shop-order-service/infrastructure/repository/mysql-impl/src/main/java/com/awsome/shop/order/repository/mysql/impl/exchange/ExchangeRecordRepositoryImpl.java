package com.awsome.shop.order.repository.mysql.impl.exchange;

import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.domain.model.exchange.ExchangeRecordEntity;
import com.awsome.shop.order.domain.model.exchange.ExchangeRecordStatsEntity;
import com.awsome.shop.order.repository.exchange.ExchangeRecordRepository;
import com.awsome.shop.order.repository.mysql.mapper.exchange.ExchangeRecordMapper;
import com.awsome.shop.order.repository.mysql.po.exchange.ExchangeRecordPO;
import com.awsome.shop.order.repository.mysql.po.exchange.ExchangeRecordStatsPO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * 积分兑换记录 仓储实现
 */
@Repository
@RequiredArgsConstructor
public class ExchangeRecordRepositoryImpl implements ExchangeRecordRepository {

    private final ExchangeRecordMapper exchangeRecordMapper;

    @Override
    public ExchangeRecordEntity getById(Long id) {
        ExchangeRecordPO po = exchangeRecordMapper.selectById(id);
        return po == null ? null : toEntity(po);
    }

    @Override
    public PageResult<ExchangeRecordEntity> page(int page, int size, String keyword, String status,
                                                  LocalDateTime startTime, LocalDateTime endTime) {
        IPage<ExchangeRecordPO> result = exchangeRecordMapper.selectPage(
                new Page<>(page, size), keyword, status, startTime, endTime);

        PageResult<ExchangeRecordEntity> pageResult = new PageResult<>();
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setTotal(result.getTotal());
        pageResult.setPages(result.getPages());
        pageResult.setRecords(result.getRecords().stream().map(this::toEntity).collect(Collectors.toList()));
        return pageResult;
    }

    @Override
    public PageResult<ExchangeRecordEntity> pageByUser(int page, int size, Long userId, String status) {
        IPage<ExchangeRecordPO> result = exchangeRecordMapper.selectPageByUser(
                new Page<>(page, size), userId, status);

        PageResult<ExchangeRecordEntity> pageResult = new PageResult<>();
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setTotal(result.getTotal());
        pageResult.setPages(result.getPages());
        pageResult.setRecords(result.getRecords().stream().map(this::toEntity).collect(Collectors.toList()));
        return pageResult;
    }

    @Override
    public ExchangeRecordEntity save(ExchangeRecordEntity entity) {
        ExchangeRecordPO po = toPO(entity);
        exchangeRecordMapper.insert(po);
        entity.setId(po.getId());
        return entity;
    }

    @Override
    public void updateStatus(Long id, String status) {
        ExchangeRecordPO po = new ExchangeRecordPO();
        po.setId(id);
        po.setStatus(status);
        exchangeRecordMapper.updateById(po);
    }

    @Override
    public void updateStatus(Long id, String status, String trackingNumber) {
        ExchangeRecordPO po = new ExchangeRecordPO();
        po.setId(id);
        po.setStatus(status);
        po.setTrackingNumber(trackingNumber);
        exchangeRecordMapper.updateById(po);
    }

    @Override
    public ExchangeRecordStatsEntity stats() {
        ExchangeRecordStatsPO po = exchangeRecordMapper.selectStats();
        ExchangeRecordStatsEntity entity = new ExchangeRecordStatsEntity();
        entity.setTotalCount(po.getTotalCount());
        entity.setPendingDeliveryCount(po.getPendingDeliveryCount());
        entity.setCompletedCount(po.getCompletedCount());
        entity.setTotalPointsConsumed(po.getTotalPointsConsumed());
        return entity;
    }

    private ExchangeRecordEntity toEntity(ExchangeRecordPO po) {
        ExchangeRecordEntity entity = new ExchangeRecordEntity();
        entity.setId(po.getId());
        entity.setOrderNo(po.getOrderNo());
        entity.setProductId(po.getProductId());
        entity.setProductName(po.getProductName());
        entity.setProductDesc(po.getProductDesc());
        entity.setProductImageUrl(po.getProductImageUrl());
        entity.setUserId(po.getUserId());
        entity.setEmployeeName(po.getEmployeeName());
        entity.setQuantity(po.getQuantity());
        entity.setPointsCost(po.getPointsCost());
        entity.setExchangeTime(po.getExchangeTime());
        entity.setStatus(po.getStatus());
        entity.setTrackingNumber(po.getTrackingNumber());
        entity.setCreatedAt(po.getCreatedAt());
        entity.setUpdatedAt(po.getUpdatedAt());
        return entity;
    }

    private ExchangeRecordPO toPO(ExchangeRecordEntity entity) {
        ExchangeRecordPO po = new ExchangeRecordPO();
        po.setId(entity.getId());
        po.setOrderNo(entity.getOrderNo());
        po.setProductId(entity.getProductId());
        po.setProductName(entity.getProductName());
        po.setProductDesc(entity.getProductDesc());
        po.setProductImageUrl(entity.getProductImageUrl());
        po.setUserId(entity.getUserId());
        po.setEmployeeName(entity.getEmployeeName());
        po.setQuantity(entity.getQuantity());
        po.setPointsCost(entity.getPointsCost());
        po.setExchangeTime(entity.getExchangeTime());
        po.setStatus(entity.getStatus());
        po.setTrackingNumber(entity.getTrackingNumber());
        return po;
    }
}
