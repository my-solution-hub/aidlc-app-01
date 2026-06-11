package com.awsome.shop.order.repository.mysql.mapper.exchange;

import com.awsome.shop.order.repository.mysql.po.exchange.ExchangeRecordPO;
import com.awsome.shop.order.repository.mysql.po.exchange.ExchangeRecordStatsPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;

/**
 * 积分兑换记录 Mapper 接口
 */
@Mapper
public interface ExchangeRecordMapper extends BaseMapper<ExchangeRecordPO> {

    /**
     * 分页查询
     *
     * @param page      MyBatis-Plus 分页对象
     * @param keyword   关键词模糊查询（订单编号/员工姓名）
     * @param status    状态精确匹配
     * @param startTime 开始时间
     * @param endTime   结束时间
     * @return 分页结果
     */
    IPage<ExchangeRecordPO> selectPage(IPage<ExchangeRecordPO> page,
                                       @Param("keyword") String keyword,
                                       @Param("status") String status,
                                       @Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime);

    /**
     * 按员工分页查询（员工端）
     *
     * @param page   分页对象
     * @param userId 员工用户ID
     * @param status 状态精确匹配（可选）
     * @return 分页结果
     */
    IPage<ExchangeRecordPO> selectPageByUser(IPage<ExchangeRecordPO> page,
                                             @Param("userId") Long userId,
                                             @Param("status") String status,
                                             @Param("keyword") String keyword);

    /**
     * 统计查询
     *
     * @return 统计结果
     */
    ExchangeRecordStatsPO selectStats();
}
