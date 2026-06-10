package com.awsome.shop.point.application.api.dto.account;

import lombok.Data;

/**
 * 积分余额 DTO（管理端手动调整结果 US-021）
 */
@Data
public class PointBalanceDTO {

    private Long userId;

    private Integer balance;

    private Integer totalEarned;

    private Integer totalUsed;
}
