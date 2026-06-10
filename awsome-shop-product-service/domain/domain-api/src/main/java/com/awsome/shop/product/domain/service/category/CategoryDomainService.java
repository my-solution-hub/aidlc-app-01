package com.awsome.shop.product.domain.service.category;

import com.awsome.shop.product.domain.model.category.CategoryEntity;

import java.util.List;

/**
 * Category 领域服务接口
 */
public interface CategoryDomainService {

    List<CategoryEntity> list(String name, Integer status);

    CategoryEntity getById(Long id);

    CategoryEntity create(String name, Long parentId, String icon,
                          Integer sortOrder, Integer status, String description);

    CategoryEntity update(Long id, String name, Long parentId, String icon,
                          Integer sortOrder, Integer status, String description);

    void deleteById(Long id);

    /** 更新类目状态（启用/禁用） */
    CategoryEntity updateStatus(Long id, Integer status);
}
