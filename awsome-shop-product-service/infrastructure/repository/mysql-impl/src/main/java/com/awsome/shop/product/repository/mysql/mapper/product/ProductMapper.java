package com.awsome.shop.product.repository.mysql.mapper.product;

import com.awsome.shop.product.repository.mysql.po.product.ProductPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

/**
 * Product Mapper 接口
 */
@Mapper
public interface ProductMapper extends BaseMapper<ProductPO> {

    /**
     * 分页查询
     *
     * @param page     MyBatis-Plus 分页对象
     * @param name     名称模糊查询条件（可为 null）
     * @param category 分类精确筛选条件（可为 null）
     * @return 分页结果
     */
    IPage<ProductPO> selectPage(IPage<ProductPO> page, @Param("name") String name, @Param("category") String category);

    /**
     * 按分类名称统计商品数量
     *
     * @return Map，key 为分类名称，value 为商品数量
     */
    @MapKey("category")
    Map<String, Map<String, Object>> countGroupByCategory();
}
