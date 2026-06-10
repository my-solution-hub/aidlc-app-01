package com.awsome.shop.point.repository.mysql.po.account;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分账户持久化对象
 */
@Data
@TableName("point_account")
public class PointAccountPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Integer balance;

    private Integer totalEarned;

    private Integer totalUsed;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @Version
    @TableField(fill = FieldFill.INSERT)
    private Integer version;
}
