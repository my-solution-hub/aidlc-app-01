package com.awsome.shop.product.repository.product;

import com.awsome.shop.product.domain.model.product.ReviewEntity;
import java.util.List;

public interface ReviewRepository {
    ReviewEntity save(ReviewEntity entity);
    List<ReviewEntity> listByProduct(Long productId);
    /** [评价数, 平均分*10] */
    double[] ratingStats(Long productId);
}
