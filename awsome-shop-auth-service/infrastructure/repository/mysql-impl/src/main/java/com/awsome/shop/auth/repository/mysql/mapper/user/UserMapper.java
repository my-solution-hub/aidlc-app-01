package com.awsome.shop.auth.repository.mysql.mapper.user;

import com.awsome.shop.auth.repository.mysql.po.user.UserPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

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

    /** 总用户数（未逻辑删除） */
    @Select("SELECT COUNT(*) FROM user WHERE deleted = 0")
    long countTotal();

    /** 活跃用户数（状态 ACTIVE） */
    @Select("SELECT COUNT(*) FROM user WHERE deleted = 0 AND status = 'ACTIVE'")
    long countActive();

    /** 本月新增用户数 */
    @Select("SELECT COUNT(*) FROM user WHERE deleted = 0 "
            + "AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')")
    long countNewThisMonth();
}
