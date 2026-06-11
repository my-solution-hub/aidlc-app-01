package com.awsome.shop.product.application.api.dto.product;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateReviewRequest {
    @NotNull private Long productId;
    @NotNull private Long userId;
    @NotNull @Min(1) @Max(5) private Integer rating;
    private String content;
}
