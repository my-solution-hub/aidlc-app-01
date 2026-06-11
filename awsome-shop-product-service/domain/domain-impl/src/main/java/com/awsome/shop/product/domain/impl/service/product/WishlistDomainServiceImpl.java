package com.awsome.shop.product.domain.impl.service.product;

import com.awsome.shop.product.domain.service.product.WishlistDomainService;
import com.awsome.shop.product.repository.product.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistDomainServiceImpl implements WishlistDomainService {
    private final WishlistRepository wishlistRepository;

    @Override public void add(Long userId, Long productId) { wishlistRepository.add(userId, productId); }
    @Override public void remove(Long userId, Long productId) { wishlistRepository.remove(userId, productId); }
    @Override public List<Long> listProductIds(Long userId) { return wishlistRepository.listProductIds(userId); }
}
