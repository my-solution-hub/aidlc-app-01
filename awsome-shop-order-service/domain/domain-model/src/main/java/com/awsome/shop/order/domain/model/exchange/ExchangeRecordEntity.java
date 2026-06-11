package com.awsome.shop.order.domain.model.exchange;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分兑换记录 领域实体
 */
@Data
public class ExchangeRecordEntity {

    private Long id;
    private String orderNo;
    private Long productId;
    private String productName;
    private String productDesc;
    private String productImageUrl;
    private Long userId;
    private String employeeName;
    private Integer quantity;
    private Integer pointsCost;

    private Integer freightPoints;

    private Integer balanceAfter;
    private LocalDateTime exchangeTime;
    private String status;
    private String trackingNumber;

    private String carrier;

    private String receiver;

    private String receiverPhone;

    private String receiverAddress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
