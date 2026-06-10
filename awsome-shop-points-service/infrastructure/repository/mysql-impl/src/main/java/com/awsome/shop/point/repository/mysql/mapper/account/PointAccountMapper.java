package com.awsome.shop.point.repository.mysql.mapper.account;

import com.awsome.shop.point.repository.mysql.po.account.PointAccountPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 积分账户 Mapper
 */
@Mapper
public interface PointAccountMapper extends BaseMapper<PointAccountPO> {

    @Select("SELECT id, user_id, balance, total_earned, total_used, created_at, updated_at, version "
            + "FROM point_account WHERE user_id = #{userId}")
    PointAccountPO selectByUserId(@Param("userId") Long userId);
}
