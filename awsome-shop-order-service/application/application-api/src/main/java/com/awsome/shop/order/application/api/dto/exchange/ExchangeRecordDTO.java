package com.awsome.shop.order.application.api.dto.exchange;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分兑换记录 数据传输对象
 */
@Data
public class ExchangeRecordDTO {

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
    private LocalDateTime exchangeTime;
    private String status;
    private String trackingNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
