package com.awsome.shop.product.facade.http.controller;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.service.product.WishlistApplicationService;
import com.awsome.shop.product.facade.http.response.Result;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 心愿单(登录用户) */
@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistApplicationService wishlistApplicationService;

    @Operation(summary = "我的心愿单")
    @GetMapping
    public Result<List<ProductDTO>> list(@RequestParam("userId") Long userId) {
        return Result.success(wishlistApplicationService.list(userId));
    }

    @Operation(summary = "加入心愿单")
    @PostMapping
    public Result<Void> add(@RequestParam("userId") Long userId, @RequestParam("productId") Long productId) {
        wishlistApplicationService.add(userId, productId);
        return Result.success(null);
    }

    @Operation(summary = "移出心愿单")
    @DeleteMapping
    public Result<Void> remove(@RequestParam("userId") Long userId, @RequestParam("productId") Long productId) {
        wishlistApplicationService.remove(userId, productId);
        return Result.success(null);
    }
}
