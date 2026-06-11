package com.awsome.shop.product.domain.service.product;

import java.util.List;

public interface WishlistDomainService {
    void add(Long userId, Long productId);
    void remove(Long userId, Long productId);
    List<Long> listProductIds(Long userId);
}
