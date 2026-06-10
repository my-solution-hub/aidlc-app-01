package com.awsome.shop.product.application.api.dto.category.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 创建 Category 请求
 */
@Data
public class CreateCategoryRequest {

    @NotBlank(message = "类目名称不能为空")
    @Size(max = 100, message = "类目名称不能超过100个字符")
    private String name;

    /** 父类目ID，为空表示一级类目 */
    private Long parentId;

    @Size(max = 200, message = "图标不能超过200个字符")
    private String icon;

    private Integer sortOrder;

    private Integer status;

    private String description;
}
