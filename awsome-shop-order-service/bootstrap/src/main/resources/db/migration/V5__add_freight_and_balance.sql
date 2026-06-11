-- 兑换记录扩展:运费积分 + 兑换后余额
ALTER TABLE `exchange_record`
    ADD COLUMN `freight_points` INT DEFAULT 0    COMMENT '运费积分' AFTER `points_cost`,
    ADD COLUMN `balance_after`  INT DEFAULT NULL  COMMENT '兑换后积分余额' AFTER `freight_points`;
