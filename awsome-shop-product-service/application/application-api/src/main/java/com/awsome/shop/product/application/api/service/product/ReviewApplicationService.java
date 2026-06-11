package com.awsome.shop.product.application.api.service.product;

import com.awsome.shop.product.application.api.dto.product.CreateReviewRequest;
import com.awsome.shop.product.application.api.dto.product.ReviewDTO;
import java.util.List;

public interface ReviewApplicationService {
    ReviewDTO create(CreateReviewRequest request);
    List<ReviewDTO> list(Long productId);
}
