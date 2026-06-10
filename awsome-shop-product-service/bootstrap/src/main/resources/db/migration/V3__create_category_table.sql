CREATE TABLE `category` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name`          VARCHAR(100) NOT NULL COMMENT '类目名称',
    `parent_id`     BIGINT                DEFAULT NULL COMMENT '上级类目ID，NULL表示一级类目',
    `icon`          VARCHAR(100)          DEFAULT NULL COMMENT '类目图标名称',
    `sort_order`    INT          NOT NULL DEFAULT 100 COMMENT '排序权重',
    `status`        TINYINT      NOT NULL DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
    `description`   VARCHAR(500)          DEFAULT NULL COMMENT '类目描述',
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `created_by`    BIGINT                DEFAULT NULL COMMENT '创建人',
    `updated_by`    BIGINT                DEFAULT NULL COMMENT '更新人',
    `deleted`       TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    `version`       INT          NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    PRIMARY KEY (`id`),
    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_name` (`name`),
    INDEX `idx_sort_order` (`sort_order`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '类目表';
