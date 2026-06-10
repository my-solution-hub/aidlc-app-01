package com.awsome.shop.product.application.impl.service.product;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.dto.product.request.ListProductRequest;
import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.domain.model.product.ProductEntity;
import com.awsome.shop.product.domain.service.product.ProductDomainService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * P0-PROD-1: 产品搜索/列表 — 应用服务单元测试
 */
@ExtendWith(MockitoExtension.class)
class ProductApplicationServiceImplTest {

    @Mock
    private ProductDomainService productDomainService;

    @InjectMocks
    private ProductApplicationServiceImpl service;

    @Nested
    @DisplayName("list - 产品搜索/列表查询")
    class ListTests {

        @Test
        @DisplayName("按名称搜索 - 传入 keyword 调用 domain 层搜索")
        void list_withNameFilter_callsDomainWithName() {
            // given
            ListProductRequest request = new ListProductRequest();
            request.setPage(1);
            request.setSize(10);
            request.setName("耳机");

            ProductEntity entity = buildProduct(1L, "Sony 无线耳机", "电子产品");
            PageResult<ProductEntity> pageResult = buildPageResult(List.of(entity), 1L);
            when(productDomainService.page(1, 10, "耳机", null)).thenReturn(pageResult);

            // when
            PageResult<ProductDTO> result = service.list(request);

            // then
            assertThat(result.getRecords()).hasSize(1);
            assertThat(result.getRecords().get(0).getName()).isEqualTo("Sony 无线耳机");
            verify(productDomainService).page(1, 10, "耳机", null);
        }

        @Test
        @DisplayName("按分类搜索 - 传入 category 调用 domain 层过滤")
        void list_withCategoryFilter_callsDomainWithCategory() {
            // given
            ListProductRequest request = new ListProductRequest();
            request.setPage(1);
            request.setSize(20);
            request.setCategory("电子产品");

            PageResult<ProductEntity> pageResult = buildPageResult(List.of(), 0L);
            when(productDomainService.page(1, 20, null, "电子产品")).thenReturn(pageResult);

            // when
            PageResult<ProductDTO> result = service.list(request);

            // then
            assertThat(result.getRecords()).isEmpty();
            verify(productDomainService).page(1, 20, null, "电子产品");
        }

        @Test
        @DisplayName("无筛选条件 - 返回全部产品分页")
        void list_noFilters_returnsAllPaginated() {
            // given
            ListProductRequest request = new ListProductRequest();
            request.setPage(1);
            request.setSize(12);

            ProductEntity p1 = buildProduct(1L, "商品A", "分类1");
            ProductEntity p2 = buildProduct(2L, "商品B", "分类2");
            PageResult<ProductEntity> pageResult = buildPageResult(List.of(p1, p2), 50L);
            when(productDomainService.page(1, 12, null, null)).thenReturn(pageResult);

            // when
            PageResult<ProductDTO> result = service.list(request);

            // then
            assertThat(result.getRecords()).hasSize(2);
            assertThat(result.getTotal()).isEqualTo(50L);
        }

        @Test
        @DisplayName("搜索无结果 - 返回空列表")
        void list_noMatches_returnsEmptyList() {
            // given
            ListProductRequest request = new ListProductRequest();
            request.setPage(1);
            request.setSize(20);
            request.setName("不存在的商品xyz");

            PageResult<ProductEntity> pageResult = buildPageResult(List.of(), 0L);
            when(productDomainService.page(1, 20, "不存在的商品xyz", null))
                    .thenReturn(pageResult);

            // when
            PageResult<ProductDTO> result = service.list(request);

            // then
            assertThat(result.getRecords()).isEmpty();
            assertThat(result.getTotal()).isEqualTo(0L);
        }
    }

    private ProductEntity buildProduct(Long id, String name, String category) {
        ProductEntity entity = new ProductEntity();
        entity.setId(id);
        entity.setName(name);
        entity.setCategory(category);
        entity.setPointsPrice(500);
        entity.setStock(20);
        entity.setStatus(1);
        return entity;
    }

    private <T> PageResult<T> buildPageResult(List<T> records, Long total) {
        PageResult<T> page = new PageResult<>();
        page.setRecords(records);
        page.setTotal(total);
        page.setCurrent(1L);
        page.setSize(20L);
        page.setPages(total > 0 ? 1L : 0L);
        return page;
    }
}
