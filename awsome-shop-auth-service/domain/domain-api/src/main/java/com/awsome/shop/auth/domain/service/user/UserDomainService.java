package com.awsome.shop.auth.domain.service.user;

import com.awsome.shop.auth.common.dto.PageResult;
import com.awsome.shop.auth.domain.model.user.UserEntity;

/**
 * 用户领域服务接口
 */
public interface UserDomainService {

    PageResult<UserEntity> page(int page, int size, String username, String role, String status);

    /**
     * 创建用户（用户名/工号唯一校验 + 密码 BCrypt 加密，状态默认 ACTIVE）
     *
     * @param username   用户名
     * @param password   明文密码
     * @param nickname   昵称
     * @param employeeId 工号（可为空；非空时全局唯一）
     * @param role       角色（为空时默认 EMPLOYEE）
     * @return 创建成功的用户实体
     */
    UserEntity create(String username, String password, String nickname, String employeeId, String role);

    /**
     * 根据用户ID查询用户详情
     *
     * @param userId 用户ID
     * @return 用户实体
     */
    UserEntity getById(Long userId);

    /**
     * 更新用户可变字段（昵称、角色、工号）
     *
     * @param userId     用户ID
     * @param nickname   昵称（为空则不更新）
     * @param role       角色（为空则不更新）
     * @param employeeId 工号（为空则不更新；非空时校验唯一）
     * @return 更新后的用户实体
     */
    UserEntity update(Long userId, String nickname, String role, String employeeId, String department);

    /**
     * 更新用户状态（启用/禁用账户）
     *
     * @param userId 用户ID
     * @param status 目标状态，如 ACTIVE / DISABLED
     * @return 更新后的用户实体
     */
    UserEntity updateStatus(Long userId, String status);

    /** 用户统计: [总数, 活跃, 本月新增] */
    long[] countStats();
}
