-- 兑换记录新增快递公司字段
ALTER TABLE `exchange_record`
    ADD COLUMN `carrier` VARCHAR(64) DEFAULT NULL COMMENT '快递公司' AFTER `tracking_number`;
