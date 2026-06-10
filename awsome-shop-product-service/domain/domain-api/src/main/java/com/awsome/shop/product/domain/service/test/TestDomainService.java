package com.awsome.shop.product.domain.service.test;

import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.domain.model.test.TestEntity;

/**
 * Test 领域服务接口
 */
public interface TestDomainService {

    TestEntity getById(Long id);

    PageResult<TestEntity> page(int page, int size, String name);

    TestEntity create(String name, String description);

    TestEntity update(Long id, String name, String description);

    void delete(Long id);
}
