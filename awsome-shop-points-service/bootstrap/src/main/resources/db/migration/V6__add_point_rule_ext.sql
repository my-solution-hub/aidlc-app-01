-- 积分规则扩展字段:适用范围 / 发放方式 / 图标
ALTER TABLE `point_rule`
    ADD COLUMN `scope`        VARCHAR(100) DEFAULT '全部员工' COMMENT '适用范围' AFTER `trigger_condition`,
    ADD COLUMN `grant_method` VARCHAR(50)  DEFAULT '自动发放' COMMENT '发放方式' AFTER `scope`,
    ADD COLUMN `icon`         VARCHAR(100) DEFAULT NULL       COMMENT '规则图标' AFTER `grant_method`;
