package com.awsome.shop.product.repository.product;

import java.util.List;

public interface WishlistRepository {
    void add(Long userId, Long productId);
    void remove(Long userId, Long productId);
    List<Long> listProductIds(Long userId);
    boolean exists(Long userId, Long productId);
}
