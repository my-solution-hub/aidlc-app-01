package com.awsome.shop.point.application.api.dto.config;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分发放统计 DTO（US-022）
 */
@Data
public class PointGrantStatsDTO {

    /** 统计月份（YYYY-MM） */
    private String month;

    /** 当月发放积分总量 */
    private Integer grantedTotal;

    /** 当月覆盖员工数（去重 userId） */
    private Integer coveredEmployees;

    /** 当月最近一次发放时间 */
    private LocalDateTime lastGrantedAt;
}
