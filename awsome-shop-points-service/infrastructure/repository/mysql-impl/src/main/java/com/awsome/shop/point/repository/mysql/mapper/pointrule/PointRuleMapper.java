package com.awsome.shop.point.repository.mysql.mapper.pointrule;

import com.awsome.shop.point.repository.mysql.po.pointrule.PointRulePO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 积分规则 Mapper 接口
 */
@Mapper
public interface PointRuleMapper extends BaseMapper<PointRulePO> {

    /**
     * 分页查询
     *
     * @param page     MyBatis-Plus 分页对象
     * @param name     名称模糊查询条件（可为 null）
     * @param ruleType 规则类型精确匹配（可为 null）
     * @param status   状态精确匹配（可为 null）
     * @return 分页结果
     */
    IPage<PointRulePO> selectPage(IPage<PointRulePO> page,
                                  @Param("name") String name,
                                  @Param("ruleType") String ruleType,
                                  @Param("status") Integer status);
}
