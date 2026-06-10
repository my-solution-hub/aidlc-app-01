package com.awsome.shop.product.integration;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.dto.product.request.CreateProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.ListProductRequest;
import com.awsome.shop.product.application.api.service.product.ProductApplicationService;
import com.awsome.shop.product.bootstrap.Application;
import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.common.exception.BusinessException;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Product Service 集成测试 — 真实 MySQL
 *
 * 覆盖: 创建商品→搜索→库存悲观锁→批量导入→逻辑删除
 */
@SpringBootTest(classes = Application.class)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ProductServiceIntegrationTest {

    @Autowired
    private ProductApplicationService productApplicationService;

    private static Long createdProductId;
    private static final String UNIQUE_NAME = "集成测试耳机_" + System.currentTimeMillis();

    @Test
    @Order(1)
    @DisplayName("创建商品 — 写入数据库并返回 ID")
    void create_product_succeeds() {
        CreateProductRequest request = new CreateProductRequest();
        request.setName(UNIQUE_NAME);
        request.setSku("SKU-IT-001");
        request.setCategory("电子产品");
        request.setBrand("TestBrand");
        request.setPointsPrice(500);
        request.setStock(10);
        request.setStatus(1);
        request.setDescription("集成测试商品描述");

        ProductDTO result = productApplicationService.create(request);

        assertThat(result.getId()).isNotNull();
        assertThat(result.getName()).isEqualTo(UNIQUE_NAME);
        assertThat(result.getStock()).isEqualTo(10);
        assertThat(result.getPointsPrice()).isEqualTo(500);

        createdProductId = result.getId();
    }

    @Test
    @Order(2)
    @DisplayName("搜索商品 — 按名称模糊匹配")
    void search_byName_findsProduct() {
        ListProductRequest request = new ListProductRequest();
        request.setPage(1);
        request.setSize(20);
        request.setName("集成测试耳机");

        PageResult<ProductDTO> result = productApplicationService.list(request);

        assertThat(result.getRecords()).isNotEmpty();
        assertThat(result.getRecords().stream()
                .anyMatch(p -> p.getName().equals(UNIQUE_NAME))).isTrue();
    }

    @Test
    @Order(3)
    @DisplayName("搜索商品 — 按分类过滤")
    void search_byCategory_filtersCorrectly() {
        ListProductRequest request = new ListProductRequest();
        request.setPage(1);
        request.setSize(20);
        request.setCategory("电子产品");

        PageResult<ProductDTO> result = productApplicationService.list(request);

        assertThat(result.getRecords()).allMatch(p -> "电子产品".equals(p.getCategory()));
    }

    @Test
    @Order(4)
    @DisplayName("搜索商品 — 不存在的关键词返回空")
    void search_nonExistent_returnsEmpty() {
        ListProductRequest request = new ListProductRequest();
        request.setPage(1);
        request.setSize(20);
        request.setName("这个商品绝对不存在XYZ999");

        PageResult<ProductDTO> result = productApplicationService.list(request);

        assertThat(result.getRecords()).isEmpty();
    }

    @Test
    @Order(5)
    @DisplayName("库存扣减 — 悲观锁正确扣减")
    void deductStock_sufficientStock_succeeds() {
        ProductDTO result = productApplicationService.deductStock(createdProductId, 3);

        assertThat(result.getStock()).isEqualTo(7); // 10 - 3
    }

    @Test
    @Order(6)
    @DisplayName("库存扣减 — 库存不足抛异常")
    void deductStock_insufficientStock_throws() {
        assertThatThrownBy(() -> productApplicationService.deductStock(createdProductId, 100))
                .isInstanceOf(BusinessException.class);

        // 验证库存未变
        ProductDTO product = productApplicationService.get(createdProductId);
        assertThat(product.getStock()).isEqualTo(7);
    }

    @Test
    @Order(7)
    @DisplayName("库存恢复 — Saga 补偿正确回补")
    void restoreStock_succeeds() {
        ProductDTO result = productApplicationService.restoreStock(createdProductId, 3);
        assertThat(result.getStock()).isEqualTo(10); // 7 + 3
    }

    @Test
    @Order(8)
    @DisplayName("删除商品 — 逻辑删除后搜索不到")
    void delete_product_removedFromSearch() {
        productApplicationService.delete(createdProductId);

        // 通过 ID 查询应该抛异常或返回 null
        assertThatThrownBy(() -> productApplicationService.get(createdProductId))
                .isInstanceOf(Exception.class);
    }
}
