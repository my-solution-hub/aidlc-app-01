package com.awsome.shop.product.domain.service.product;

import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.domain.model.product.ProductEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Product 领域服务接口
 */
public interface ProductDomainService {

    ProductEntity getById(Long id);

    /**
     * 扣减库存（兑换时由 order 服务调用）。
     * 库存不足抛业务异常；成功返回扣减后的商品。
     */
    ProductEntity deductStock(Long productId, int quantity);

    /**
     * 回补库存（Saga 补偿时调用）。
     */
    ProductEntity restoreStock(Long productId, int quantity);

    PageResult<ProductEntity> page(int page, int size, String name, String category);

    ProductEntity create(String name, String sku, String category, String brand,
                         Integer pointsPrice, BigDecimal marketPrice, Integer stock,
                         Integer status, String description, String imageUrl,
                         String subtitle, String deliveryMethod, String serviceGuarantee,
                         String promotion, String colors, List<Map<String, String>> specs);

    ProductEntity update(Long id, String name, String sku, String category, String brand,
                         Integer pointsPrice, BigDecimal marketPrice, Integer stock,
                         Integer status, String description, String imageUrl,
                         String subtitle, String deliveryMethod, String serviceGuarantee,
                         String promotion, String colors, List<Map<String, String>> specs);

    void deleteById(Long id);

    /** 更新商品状态（上架/下架） */
    ProductEntity updateStatus(Long id, Integer status);

    /**
     * 按分类名称统计商品数量
     *
     * @return Map，key 为分类名称，value 为商品数量
     */
    Map<String, Long> countGroupByCategory();
}
