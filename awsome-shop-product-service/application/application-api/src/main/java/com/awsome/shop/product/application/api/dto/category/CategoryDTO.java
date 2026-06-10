package com.awsome.shop.product.application.api.dto.category;

import lombok.Data;

import java.util.List;

/**
 * Category 数据传输对象
 */
@Data
public class CategoryDTO {

    private Long id;

    private String name;

    private Long parentId;

    private String icon;

    private Integer sortOrder;

    private Integer status;

    private String description;

    private Long productCount;

    private List<CategoryDTO> children;
}
