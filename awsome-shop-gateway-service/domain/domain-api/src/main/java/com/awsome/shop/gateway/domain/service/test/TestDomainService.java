package com.awsome.shop.gateway.domain.service.test;

import com.awsome.shop.gateway.common.dto.PageResult;
import com.awsome.shop.gateway.domain.model.test.TestEntity;

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
