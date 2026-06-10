-- US-022: 完整发放配置默认值（amount 已在 V4 中初始化）
INSERT INTO `system_config` (`config_key`, `config_value`, `description`) VALUES
    ('points.distribution.cycle', 'MONTHLY', '发放周期'),
    ('points.distribution.grantDay', '1', '发放日'),
    ('points.distribution.enabled', 'true', '是否启用自动发放'),
    ('points.distribution.targetRole', 'employee', '发放目标角色');
