package com.awsome.shop.product.application.impl.service.product;

import com.awsome.shop.product.application.api.dto.product.CreateReviewRequest;
import com.awsome.shop.product.application.api.dto.product.ReviewDTO;
import com.awsome.shop.product.application.api.service.product.ReviewApplicationService;
import com.awsome.shop.product.domain.model.product.ReviewEntity;
import com.awsome.shop.product.domain.service.product.ReviewDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewApplicationServiceImpl implements ReviewApplicationService {

    private final ReviewDomainService reviewDomainService;

    @Override
    public ReviewDTO create(CreateReviewRequest r) {
        ReviewEntity e = new ReviewEntity();
        e.setProductId(r.getProductId()); e.setUserId(r.getUserId());
        e.setRating(r.getRating()); e.setContent(r.getContent());
        return toDTO(reviewDomainService.create(e));
    }

    @Override
    public List<ReviewDTO> list(Long productId) {
        return reviewDomainService.list(productId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    private ReviewDTO toDTO(ReviewEntity e) {
        ReviewDTO d = new ReviewDTO();
        d.setId(e.getId()); d.setProductId(e.getProductId()); d.setUserId(e.getUserId());
        d.setRating(e.getRating()); d.setContent(e.getContent()); d.setCreatedAt(e.getCreatedAt());
        return d;
    }
}
