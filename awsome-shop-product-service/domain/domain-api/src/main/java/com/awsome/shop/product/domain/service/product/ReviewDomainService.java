package com.awsome.shop.product.domain.service.product;

import com.awsome.shop.product.domain.model.product.ReviewEntity;
import java.util.List;

public interface ReviewDomainService {
    ReviewEntity create(ReviewEntity entity);
    List<ReviewEntity> list(Long productId);
}
