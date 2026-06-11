package com.awsome.shop.point.domain.model.account;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分流水领域实体
 */
@Data
public class PointTransactionEntity {

    private Long id;

    private Long userId;

    /** 流水类型: EARN-获得, REDEEM-兑换扣减, ADJUST-管理员调整, INIT-注册初始化 */
    private String type;

    /** 变动数量（正为增，负为减） */
    private Integer amount;

    /** 变动后余额 */
    private Integer balance;

    private String description;

    private String operator;

    private LocalDateTime createdAt;
}
