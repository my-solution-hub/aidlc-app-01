package com.awsome.shop.order.application.api.dto.exchange.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 分页查询积分兑换记录请求
 */
@Data
public class ListExchangeRecordRequest {

    @Min(value = 1, message = "页码最小为 1")
    private Integer page = 1;

    @Min(value = 1, message = "每页大小最小为 1")
    @Max(value = 100, message = "每页大小最大为 100")
    private Integer size = 20;

    private String keyword;

    private String status;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}
