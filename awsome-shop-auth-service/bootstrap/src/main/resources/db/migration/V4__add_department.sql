-- 为 user 表新增部门字段 department（可空，兼容历史数据）
ALTER TABLE `user`
    ADD COLUMN `department` VARCHAR(100) DEFAULT NULL COMMENT '所属部门' AFTER `employee_id`;

-- 回填种子账户部门
UPDATE `user` SET `department` = '系统管理部' WHERE `username` = 'admin' AND `department` IS NULL;
UPDATE `user` SET `department` = '技术研发部' WHERE `username` = 'employee' AND `department` IS NULL;
