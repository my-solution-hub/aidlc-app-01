package com.awsome.shop.point.repository.mysql.po.pointrule;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分规则持久化对象
 */
@Data
@TableName("point_rule")
public class PointRulePO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String description;

    private String ruleType;

    private Integer pointValueMin;

    private Integer pointValueMax;

    private String triggerCondition;

    private Integer status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;

    @Version
    @TableField(fill = FieldFill.INSERT)
    private Integer version;
}
