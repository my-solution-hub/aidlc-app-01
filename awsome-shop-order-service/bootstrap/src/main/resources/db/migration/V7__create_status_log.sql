-- 订单状态变更日志(用于订单详情状态时间线)
CREATE TABLE `exchange_status_log` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `exchange_id`   BIGINT       NOT NULL COMMENT '兑换记录ID',
    `status`        VARCHAR(32)  NOT NULL COMMENT '状态',
    `remark`        VARCHAR(255) DEFAULT NULL COMMENT '说明',
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发生时间',
    PRIMARY KEY (`id`),
    INDEX `idx_exchange_id` (`exchange_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '兑换状态日志';
