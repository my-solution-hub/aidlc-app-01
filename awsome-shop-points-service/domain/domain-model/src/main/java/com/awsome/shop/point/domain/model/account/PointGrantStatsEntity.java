package com.awsome.shop.point.domain.model.account;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分发放统计领域实体（US-022）
 */
@Data
public class PointGrantStatsEntity {

    /** 当月发放积分总量 */
    private Integer grantedTotal;

    /** 当月覆盖员工数（去重 userId） */
    private Integer coveredEmployees;

    /** 当月最近一次发放时间 */
    private LocalDateTime lastGrantedAt;
}
