package com.awsome.shop.product.repository.mysql.impl.product;

import com.awsome.shop.product.repository.mysql.mapper.product.WishlistMapper;
import com.awsome.shop.product.repository.mysql.po.product.WishlistPO;
import com.awsome.shop.product.repository.product.WishlistRepository;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class WishlistRepositoryImpl implements WishlistRepository {

    private final WishlistMapper wishlistMapper;

    @Override
    public void add(Long userId, Long productId) {
        if (exists(userId, productId)) return;
        WishlistPO po = new WishlistPO();
        po.setUserId(userId);
        po.setProductId(productId);
        po.setCreatedAt(LocalDateTime.now());
        wishlistMapper.insert(po);
    }

    @Override
    public void remove(Long userId, Long productId) {
        QueryWrapper<WishlistPO> w = new QueryWrapper<>();
        w.eq("user_id", userId).eq("product_id", productId);
        wishlistMapper.delete(w);
    }

    @Override
    public List<Long> listProductIds(Long userId) {
        QueryWrapper<WishlistPO> w = new QueryWrapper<>();
        w.eq("user_id", userId).orderByDesc("id");
        return wishlistMapper.selectList(w).stream().map(WishlistPO::getProductId).collect(Collectors.toList());
    }

    @Override
    public boolean exists(Long userId, Long productId) {
        QueryWrapper<WishlistPO> w = new QueryWrapper<>();
        w.eq("user_id", userId).eq("product_id", productId);
        return wishlistMapper.selectCount(w) > 0;
    }
}
