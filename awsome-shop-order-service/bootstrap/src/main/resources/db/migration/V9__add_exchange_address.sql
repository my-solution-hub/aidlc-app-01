-- 兑换记录收货信息快照
ALTER TABLE `exchange_record`
    ADD COLUMN `receiver`        VARCHAR(50)  DEFAULT NULL COMMENT '收货人' AFTER `carrier`,
    ADD COLUMN `receiver_phone`  VARCHAR(20)  DEFAULT NULL COMMENT '收货电话' AFTER `receiver`,
    ADD COLUMN `receiver_address` VARCHAR(300) DEFAULT NULL COMMENT '收货地址' AFTER `receiver_phone`;
