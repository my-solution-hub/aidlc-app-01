package com.awsome.shop.product.application.api.service.product;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import java.util.List;

public interface WishlistApplicationService {
    void add(Long userId, Long productId);
    void remove(Long userId, Long productId);
    List<ProductDTO> list(Long userId);
}
