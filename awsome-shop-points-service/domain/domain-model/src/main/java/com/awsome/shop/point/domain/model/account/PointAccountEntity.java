package com.awsome.shop.point.domain.model.account;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分账户领域实体（每个用户一个账户）
 */
@Data
public class PointAccountEntity {

    private Long id;

    private Long userId;

    /** 当前可用积分余额 */
    private Integer balance;

    /** 累计获得积分 */
    private Integer totalEarned;

    /** 累计使用积分 */
    private Integer totalUsed;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
