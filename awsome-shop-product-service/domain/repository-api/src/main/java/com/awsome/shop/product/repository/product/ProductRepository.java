package com.awsome.shop.product.repository.product;

import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.domain.model.product.ProductEntity;

import java.util.Map;

/**
 * Product 仓储接口
 */
public interface ProductRepository {

    ProductEntity getById(Long id);

    /**
     * 按主键查询并加悲观锁（SELECT ... FOR UPDATE）。
     *
     * <p>用于库存扣减的并发控制（BR-PROD-007），必须在事务内调用。</p>
     *
     * @param id 商品主键
     * @return 商品实体，不存在时返回 null
     */
    ProductEntity getByIdForUpdate(Long id);

    ProductEntity getBySku(String sku);

    PageResult<ProductEntity> page(int page, int size, String name, String category);

    void save(ProductEntity entity);

    void update(ProductEntity entity);

    void deleteById(Long id);

    /**
     * 按分类名称统计商品数量
     *
     * @return Map，key 为分类名称，value 为商品数量
     */
    Map<String, Long> countGroupByCategory();

    /** [总商品数, 上架数] */
    long[] countStats();

    /** 记录库存调整日志 */
    void addStockLog(Long productId, String changeType, int quantity, int beforeStock, int afterStock, String reason);
}
