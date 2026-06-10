package com.awsome.shop.auth.repository.mysql.mapper.user;

import com.awsome.shop.auth.repository.mysql.po.user.UserPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * User Mapper 接口
 */
@Mapper
public interface UserMapper extends BaseMapper<UserPO> {

    /**
     * 分页查询用户列表
     *
     * @param page     MyBatis-Plus 分页对象
     * @param username 用户名模糊查询条件（可为 null）
     * @param role     角色精确匹配条件（可为 null）
     * @param status   状态精确匹配条件（可为 null）
     * @return 分页结果
     */
    IPage<UserPO> selectPage(IPage<UserPO> page,
                             @Param("username") String username,
                             @Param("role") String role,
                             @Param("status") String status);
}
