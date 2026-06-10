CREATE TABLE `point_account` (
    `id`           BIGINT   NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id`      BIGINT   NOT NULL COMMENT '用户ID',
    `balance`      INT      NOT NULL DEFAULT 0 COMMENT '当前可用积分余额',
    `total_earned` INT      NOT NULL DEFAULT 0 COMMENT '累计获得积分',
    `total_used`   INT      NOT NULL DEFAULT 0 COMMENT '累计使用积分',
    `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `version`      INT      NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '积分账户表';

CREATE TABLE `point_transaction` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id`     BIGINT       NOT NULL COMMENT '用户ID',
    `type`        VARCHAR(20)  NOT NULL COMMENT '类型: EARN/REDEEM/ADJUST/INIT',
    `amount`      INT          NOT NULL COMMENT '变动数量(正增负减)',
    `balance`     INT          NOT NULL COMMENT '变动后余额',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '描述',
    `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_type` (`type`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '积分流水表';
