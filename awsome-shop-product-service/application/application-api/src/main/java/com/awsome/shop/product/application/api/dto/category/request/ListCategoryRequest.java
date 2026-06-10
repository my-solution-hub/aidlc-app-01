package com.awsome.shop.product.application.api.dto.category.request;

import lombok.Data;

/**
 * 查询类目列表请求
 */
@Data
public class ListCategoryRequest {

    private String name;

    private Integer status;
}
