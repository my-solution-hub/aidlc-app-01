package com.awsome.shop.product.domain.model.product;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewEntity {
    private Long id;
    private Long productId;
    private Long userId;
    private Integer rating;
    private String content;
    private LocalDateTime createdAt;
}
