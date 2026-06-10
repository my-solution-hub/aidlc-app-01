package com.awsome.shop.point.repository.mysql.po.account;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分发放统计投影对象（US-022）
 */
@Data
public class PointGrantStatsPO {

    private Integer grantedTotal;

    private Integer coveredEmployees;

    private LocalDateTime lastGrantedAt;
}
