CREATE TABLE `user` (
    `id`                    BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username`              VARCHAR(50)  NOT NULL COMMENT '用户名',
    `password_hash`         VARCHAR(255) NOT NULL COMMENT '密码哈希值',
    `nickname`              VARCHAR(100)          DEFAULT NULL COMMENT '昵称',
    `role`                  VARCHAR(20)  NOT NULL DEFAULT 'EMPLOYEE' COMMENT '角色: EMPLOYEE-员工, ADMIN-管理员',
    `status`                VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE-正常, LOCKED-锁定, DISABLED-禁用',
    `failed_login_attempts` INT          NOT NULL DEFAULT 0 COMMENT '连续登录失败次数',
    `lock_expired_at`       DATETIME              DEFAULT NULL COMMENT '锁定过期时间',
    `last_login_at`         DATETIME              DEFAULT NULL COMMENT '最后登录时间',
    `created_at`            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `created_by`            BIGINT                DEFAULT NULL COMMENT '创建人',
    `updated_by`            BIGINT                DEFAULT NULL COMMENT '更新人',
    `deleted`               TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除 0-未删除 1-已删除',
    `version`               INT          NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    PRIMARY KEY (`id`),
    UNIQUE INDEX `uk_username` (`username`, `deleted`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表';

-- 插入默认管理员账户 (密码: admin123，使用 BCrypt 加密)
INSERT INTO `user` (`username`, `password_hash`, `nickname`, `role`, `status`)
VALUES ('admin', '$2b$10$d9d1rsMTb5H08rbbOMB1xeYv4TyGqds/noBBHpgkAvV2AJNB2DzEW', '系统管理员', 'ADMIN', 'ACTIVE');

-- 插入默认员工账户 (密码: employee123，使用 BCrypt 加密)
INSERT INTO `user` (`username`, `password_hash`, `nickname`, `role`, `status`)
VALUES ('employee', '$2b$10$LICm.1cUM63/Fp/6elh8ZuG3vYRgnbjiGoTDRi944KnNVRuMuoX8m', '李明', 'EMPLOYEE', 'ACTIVE');
