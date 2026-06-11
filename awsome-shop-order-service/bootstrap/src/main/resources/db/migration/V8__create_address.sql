-- 收货地址簿
CREATE TABLE `address` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id`       BIGINT       NOT NULL COMMENT '用户ID',
    `receiver`      VARCHAR(50)  NOT NULL COMMENT '收货人',
    `phone`         VARCHAR(20)  NOT NULL COMMENT '手机号',
    `region`        VARCHAR(200) DEFAULT NULL COMMENT '所在地区(省市区)',
    `detail`        VARCHAR(255) NOT NULL COMMENT '详细地址',
    `postal_code`   VARCHAR(10)  DEFAULT NULL COMMENT '邮编',
    `is_default`    TINYINT      NOT NULL DEFAULT 0 COMMENT '是否默认 1是',
    `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted`       TINYINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '收货地址';
