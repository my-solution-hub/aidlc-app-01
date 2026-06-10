-- 为 user 表新增工号字段 employee_id（全局唯一，可空以兼容历史数据）
ALTER TABLE `user`
    ADD COLUMN `employee_id` VARCHAR(50) DEFAULT NULL COMMENT '工号（唯一）' AFTER `nickname`;

-- 工号唯一索引（与 deleted 组合，兼容逻辑删除场景）
CREATE UNIQUE INDEX `uk_employee_id` ON `user` (`employee_id`, `deleted`);

-- 回填种子账户工号
UPDATE `user` SET `employee_id` = 'EMP001' WHERE `username` = 'admin' AND `employee_id` IS NULL;
UPDATE `user` SET `employee_id` = 'EMP002' WHERE `username` = 'employee' AND `employee_id` IS NULL;
