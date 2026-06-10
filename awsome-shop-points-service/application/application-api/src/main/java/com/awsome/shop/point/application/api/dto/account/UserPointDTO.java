package com.awsome.shop.point.application.api.dto.account;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 员工积分列表项 DTO（管理端 US-020）
 *
 * <p>积分字段来自 points-service；username/nickname/employeeNo 由 points 调 auth-service 充填。</p>
 */
@Data
public class UserPointDTO {

    private Long userId;

    /** 登录账号（来自 auth-service） */
    private String username;

    /** 姓名（来自 auth-service） */
    private String nickname;

    /** 工号（来自 auth-service，对应 auth 的 employeeId） */
    private String employeeNo;

    private Integer balance;

    private Integer totalEarned;

    private Integer totalUsed;

    private LocalDateTime updatedAt;
}
