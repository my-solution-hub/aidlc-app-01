package com.awsome.shop.product.domain.model.category;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Category 领域实体
 */
@Data
public class CategoryEntity {

    private Long id;

    private String name;

    private Long parentId;

    private String icon;

    private Integer sortOrder;

    private Integer status;

    private String description;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public void updateInfo(String name, Long parentId, String icon,
                           Integer sortOrder, Integer status, String description) {
        this.name = name;
        this.parentId = parentId;
        this.icon = icon;
        this.sortOrder = sortOrder;
        this.status = status;
        this.description = description;
    }
}
