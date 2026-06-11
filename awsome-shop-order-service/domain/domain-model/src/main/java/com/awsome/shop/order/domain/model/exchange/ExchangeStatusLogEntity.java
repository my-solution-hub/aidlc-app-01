package com.awsome.shop.order.domain.model.exchange;

import lombok.Data;
import java.time.LocalDateTime;

/** 兑换状态日志领域实体 */
@Data
public class ExchangeStatusLogEntity {
    private Long id;
    private Long exchangeId;
    private String status;
    private String remark;
    private LocalDateTime createdAt;
}
