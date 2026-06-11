package com.awsome.shop.product.application.impl.service.product;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.service.product.ProductApplicationService;
import com.awsome.shop.product.application.api.service.product.WishlistApplicationService;
import com.awsome.shop.product.domain.service.product.WishlistDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistApplicationServiceImpl implements WishlistApplicationService {

    private final WishlistDomainService wishlistDomainService;
    private final ProductApplicationService productApplicationService;

    @Override
    public void add(Long userId, Long productId) { wishlistDomainService.add(userId, productId); }

    @Override
    public void remove(Long userId, Long productId) { wishlistDomainService.remove(userId, productId); }

    @Override
    public List<ProductDTO> list(Long userId) {
        List<ProductDTO> result = new ArrayList<>();
        for (Long pid : wishlistDomainService.listProductIds(userId)) {
            try { result.add(productApplicationService.get(pid)); } catch (Exception ignored) {}
        }
        return result;
    }
}
