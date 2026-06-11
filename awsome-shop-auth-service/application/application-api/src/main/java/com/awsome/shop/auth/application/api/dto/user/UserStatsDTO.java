package com.awsome.shop.auth.application.api.dto.user;

import lombok.Data;

/**
 * 用户统计 DTO（管理端用户管理页顶部卡片）
 */
@Data
public class UserStatsDTO {

    /** 总用户数 */
    private Long totalUsers;

    /** 活跃用户数（状态 ACTIVE） */
    private Long activeUsers;

    /** 本月新增用户数 */
    private Long newThisMonth;
}
