ALTER TABLE `exchange_record`
    ADD COLUMN `product_id`        BIGINT       DEFAULT NULL COMMENT '商品ID',
    ADD COLUMN `user_id`           BIGINT       DEFAULT NULL COMMENT '兑换员工用户ID',
    ADD COLUMN `quantity`          INT          DEFAULT 1    COMMENT '兑换数量',
    ADD COLUMN `product_image_url` VARCHAR(500) DEFAULT NULL COMMENT '商品图片URL';

ALTER TABLE `exchange_record`
    ADD INDEX `idx_user_id` (`user_id`);
