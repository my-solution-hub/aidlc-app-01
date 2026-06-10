package com.awsome.shop.point.repository.mysql.mapper.account;

import com.awsome.shop.point.repository.mysql.po.account.PointAccountPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 积分账户 Mapper
 */
@Mapper
public interface PointAccountMapper extends BaseMapper<PointAccountPO> {

    @Select("SELECT id, user_id, balance, total_earned, total_used, created_at, updated_at, version "
            + "FROM point_account WHERE user_id = #{userId}")
    PointAccountPO selectByUserId(@Param("userId") Long userId);

    @Select("SELECT user_id FROM point_account ORDER BY user_id ASC")
    List<Long> selectAllUserIds();

    /** 分页查询账户列表（管理端），userId 非空时按用户ID精确过滤 */
    IPage<PointAccountPO> selectPageAccounts(IPage<PointAccountPO> page, @Param("userId") Long userId);
}
