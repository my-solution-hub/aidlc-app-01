package com.awsome.shop.product.repository.test;

import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.domain.model.test.TestEntity;

/**
 * Test 仓储接口
 */
public interface TestRepository {

    TestEntity getById(Long id);

    PageResult<TestEntity> page(int page, int size, String name);

    void save(TestEntity entity);

    void update(TestEntity entity);

    void deleteById(Long id);
}
