CREATE TABLE `product_review` (
    `id`         BIGINT      NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT      NOT NULL COMMENT '商品ID',
    `user_id`    BIGINT      NOT NULL COMMENT '用户ID',
    `rating`     INT         NOT NULL COMMENT '评分1-5',
    `content`    VARCHAR(500) DEFAULT NULL COMMENT '评价内容',
    `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_product_id` (`product_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '商品评价';
