-- 库存调整记录
CREATE TABLE `stock_log` (
    `id`          BIGINT      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `product_id`  BIGINT      NOT NULL COMMENT '商品ID',
    `change_type` VARCHAR(16) NOT NULL COMMENT '类型: IN-入库 OUT-出库',
    `quantity`    INT         NOT NULL COMMENT '调整数量',
    `before_stock` INT        NOT NULL COMMENT '调整前库存',
    `after_stock`  INT        NOT NULL COMMENT '调整后库存',
    `reason`      VARCHAR(255) DEFAULT NULL COMMENT '调整原因',
    `created_at`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '时间',
    PRIMARY KEY (`id`),
    INDEX `idx_product_id` (`product_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '库存调整记录';
