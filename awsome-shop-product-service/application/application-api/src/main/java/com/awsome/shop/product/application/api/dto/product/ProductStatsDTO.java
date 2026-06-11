package com.awsome.shop.product.application.api.dto.product;

import lombok.Data;

/** 商品统计 DTO(Dashboard) */
@Data
public class ProductStatsDTO {
    private Long totalProducts;
    private Long onSaleProducts;
}
