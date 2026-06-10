package com.awsome.shop.auth.domain.service.user;

import com.awsome.shop.auth.common.dto.PageResult;
import com.awsome.shop.auth.domain.model.user.UserEntity;

/**
 * 用户领域服务接口
 */
public interface UserDomainService {

    PageResult<UserEntity> page(int page, int size, String username, String role, String status);

    /**
     * 创建用户（用户名唯一校验 + 密码 BCrypt 加密，状态默认 ACTIVE）
     *
     * @param username 用户名
     * @param password 明文密码
     * @param nickname 昵称
     * @param role     角色（为空时默认 EMPLOYEE）
     * @return 创建成功的用户实体
     */
    UserEntity create(String username, String password, String nickname, String role);

    /**
     * 更新用户状态（启用/禁用账户）
     *
     * @param userId 用户ID
     * @param status 目标状态，如 ACTIVE / DISABLED
     * @return 更新后的用户实体
     */
    UserEntity updateStatus(Long userId, String status);
}
