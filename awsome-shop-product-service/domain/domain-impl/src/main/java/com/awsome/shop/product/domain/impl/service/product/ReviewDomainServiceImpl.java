package com.awsome.shop.product.domain.impl.service.product;

import com.awsome.shop.product.domain.model.product.ReviewEntity;
import com.awsome.shop.product.domain.service.product.ReviewDomainService;
import com.awsome.shop.product.repository.product.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewDomainServiceImpl implements ReviewDomainService {
    private final ReviewRepository reviewRepository;
    @Override public ReviewEntity create(ReviewEntity e) { return reviewRepository.save(e); }
    @Override public List<ReviewEntity> list(Long productId) { return reviewRepository.listByProduct(productId); }
}
