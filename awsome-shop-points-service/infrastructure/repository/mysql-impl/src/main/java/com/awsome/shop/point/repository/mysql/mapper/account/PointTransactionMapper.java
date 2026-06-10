package com.awsome.shop.point.repository.mysql.mapper.account;

import com.awsome.shop.point.repository.mysql.po.account.PointTransactionPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 积分流水 Mapper
 */
@Mapper
public interface PointTransactionMapper extends BaseMapper<PointTransactionPO> {

    IPage<PointTransactionPO> selectPageByUser(IPage<PointTransactionPO> page,
                                               @Param("userId") Long userId,
                                               @Param("type") String type);
}
