package com.awsome.shop.order.application.api.dto.exchange;

import lombok.Data;
import java.time.LocalDateTime;

/** 订单状态时间线项 */
@Data
public class StatusLogDTO {
    private String status;
    private String remark;
    private LocalDateTime time;
}
