package com.awsome.shop.point.repository.mysql.po.account;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分流水持久化对象
 */
@Data
@TableName("point_transaction")
public class PointTransactionPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String type;

    private Integer amount;

    private Integer balance;

    private String description;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
