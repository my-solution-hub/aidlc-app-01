-- 积分流水新增操作人字段
ALTER TABLE `point_transaction`
    ADD COLUMN `operator` VARCHAR(100) DEFAULT '系统' COMMENT '操作人' AFTER `description`;
