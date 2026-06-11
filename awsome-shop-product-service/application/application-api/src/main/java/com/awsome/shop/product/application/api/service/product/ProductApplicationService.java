package com.awsome.shop.product.application.api.service.product;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.dto.product.request.CreateProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.ListProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.UpdateProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.UpdateProductStatusRequest;
import com.awsome.shop.product.common.dto.PageResult;

/**
 * Product 应用服务接口
 */
public interface ProductApplicationService {

    PageResult<ProductDTO> list(ListProductRequest request);

    ProductDTO create(CreateProductRequest request);

    ProductDTO update(UpdateProductRequest request);

    void delete(Long id);

    ProductDTO updateStatus(UpdateProductStatusRequest request);

    ProductDTO get(Long id);

    com.awsome.shop.product.application.api.dto.product.ProductStatsDTO stats();

    /** 扣减库存（兑换，被 order 调用） */
    ProductDTO deductStock(Long productId, int quantity);

    /** 回补库存（Saga 补偿，被 order 调用） */
    ProductDTO restoreStock(Long productId, int quantity);

    ProductDTO adminAdjustStock(Long productId, String changeType, int quantity, String reason);
}
