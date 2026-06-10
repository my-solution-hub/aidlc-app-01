package com.awsome.shop.point.application.api.dto.account;

import lombok.Data;

/**
 * 积分账户 DTO
 */
@Data
public class PointAccountDTO {

    private Long userId;

    private Integer balance;

    private Integer totalEarned;

    private Integer totalUsed;
}
