package com.awsome.shop.order.repository.mysql.po.exchange;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 兑换状态日志 PO */
@Data
@TableName("exchange_status_log")
public class ExchangeStatusLogPO {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long exchangeId;
    private String status;
    private String remark;
    private LocalDateTime createdAt;
}
