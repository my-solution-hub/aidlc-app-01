package com.awsome.shop.product.repository.mysql.impl.product;

import com.awsome.shop.product.domain.model.product.ReviewEntity;
import com.awsome.shop.product.repository.mysql.mapper.product.ReviewMapper;
import com.awsome.shop.product.repository.mysql.po.product.ReviewPO;
import com.awsome.shop.product.repository.product.ReviewRepository;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ReviewRepositoryImpl implements ReviewRepository {

    private final ReviewMapper reviewMapper;

    @Override
    public ReviewEntity save(ReviewEntity e) {
        ReviewPO po = new ReviewPO();
        po.setProductId(e.getProductId()); po.setUserId(e.getUserId());
        po.setRating(e.getRating()); po.setContent(e.getContent());
        po.setCreatedAt(LocalDateTime.now());
        reviewMapper.insert(po);
        e.setId(po.getId()); e.setCreatedAt(po.getCreatedAt());
        return e;
    }

    @Override
    public List<ReviewEntity> listByProduct(Long productId) {
        QueryWrapper<ReviewPO> w = new QueryWrapper<>();
        w.eq("product_id", productId).orderByDesc("id");
        return reviewMapper.selectList(w).stream().map(po -> {
            ReviewEntity e = new ReviewEntity();
            e.setId(po.getId()); e.setProductId(po.getProductId()); e.setUserId(po.getUserId());
            e.setRating(po.getRating()); e.setContent(po.getContent()); e.setCreatedAt(po.getCreatedAt());
            return e;
        }).collect(Collectors.toList());
    }

    @Override
    public double[] ratingStats(Long productId) {
        List<ReviewPO> list = reviewMapper.selectList(new QueryWrapper<ReviewPO>().eq("product_id", productId));
        if (list.isEmpty()) return new double[]{0, 0};
        double avg = list.stream().mapToInt(ReviewPO::getRating).average().orElse(0);
        return new double[]{list.size(), avg};
    }
}
