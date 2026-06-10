package com.awsome.shop.point.repository.mysql.mapper.account;

import com.awsome.shop.point.repository.mysql.po.account.PointGrantStatsPO;
import com.awsome.shop.point.repository.mysql.po.account.PointTransactionPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;

/**
 * 积分流水 Mapper
 */
@Mapper
public interface PointTransactionMapper extends BaseMapper<PointTransactionPO> {

    IPage<PointTransactionPO> selectPageByUser(IPage<PointTransactionPO> page,
                                               @Param("userId") Long userId,
                                               @Param("type") String type);

    /** 统计 [start, end) 区间内 type=DISTRIBUTION 的发放总量/覆盖人数/最近发放时间 */
    PointGrantStatsPO statDistribution(@Param("start") LocalDateTime start,
                                       @Param("end") LocalDateTime end);
}
