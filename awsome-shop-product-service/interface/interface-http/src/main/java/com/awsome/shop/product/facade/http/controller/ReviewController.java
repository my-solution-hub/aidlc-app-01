package com.awsome.shop.product.facade.http.controller;

import com.awsome.shop.product.application.api.dto.product.CreateReviewRequest;
import com.awsome.shop.product.application.api.dto.product.ReviewDTO;
import com.awsome.shop.product.application.api.service.product.ReviewApplicationService;
import com.awsome.shop.product.facade.http.response.Result;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 商品评价 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewApplicationService reviewApplicationService;

    @Operation(summary = "商品评价列表(PUBLIC)")
    @GetMapping("/{id}/reviews")
    public Result<List<ReviewDTO>> list(@PathVariable("id") Long id) {
        return Result.success(reviewApplicationService.list(id));
    }

    @Operation(summary = "提交商品评价(登录)")
    @PostMapping("/{id}/reviews")
    public Result<ReviewDTO> create(@PathVariable("id") Long id, @RequestBody @Valid CreateReviewRequest request) {
        request.setProductId(id);
        return Result.success(reviewApplicationService.create(request));
    }
}
