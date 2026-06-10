package com.awsome.shop.product.repository.category;

import com.awsome.shop.product.domain.model.category.CategoryEntity;

import java.util.List;

/**
 * Category 仓储接口
 */
public interface CategoryRepository {

    CategoryEntity getById(Long id);

    List<CategoryEntity> listAll(String name, Integer status);

    void save(CategoryEntity entity);

    void update(CategoryEntity entity);

    void deleteById(Long id);
}
