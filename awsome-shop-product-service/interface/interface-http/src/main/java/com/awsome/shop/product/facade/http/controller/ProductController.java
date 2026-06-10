package com.awsome.shop.product.facade.http.controller;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.dto.product.request.CreateProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.ListProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.StockRequest;
import com.awsome.shop.product.application.api.dto.product.request.UpdateProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.UpdateProductStatusRequest;
import com.awsome.shop.product.application.api.service.product.ProductApplicationService;
import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 商品管理 Controller（RESTful）
 */
@Tag(name = "Product", description = "商品管理")
@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductApplicationService productApplicationService;

    @Operation(summary = "商品列表查询（分页 / 过滤）")
    @GetMapping("/api/products")
    public Result<PageResult<ProductDTO>> list(@Valid @ModelAttribute ListProductRequest request) {
        return Result.success(productApplicationService.list(request));
    }

    @Operation(summary = "热门推荐商品 (PROD-7) — 按销量 TOP 10")
    @GetMapping("/api/products/recommended")
    public Result<List<ProductDTO>> recommended() {
        ListProductRequest request = new ListProductRequest();
        request.setPage(1);
        request.setSize(10);
        request.setSortBy("soldCount");
        request.setSortOrder("DESC");
        return Result.success(productApplicationService.list(request).getRecords());
    }

    @Operation(summary = "商品详情查询")
    @GetMapping("/api/products/{id}")
    public Result<ProductDTO> get(@PathVariable("id") Long id) {
        return Result.success(productApplicationService.get(id));
    }

    @Operation(summary = "创建商品")
    @PostMapping("/api/admin/products")
    public Result<ProductDTO> create(@RequestBody @Valid CreateProductRequest request) {
        return Result.success(productApplicationService.create(request));
    }

    @Operation(summary = "更新商品")
    @PutMapping("/api/admin/products/{id}")
    public Result<ProductDTO> update(@PathVariable("id") Long id, @RequestBody UpdateProductRequest request) {
        request.setId(id);
        return Result.success(productApplicationService.update(request));
    }

    @Operation(summary = "删除商品")
    @DeleteMapping("/api/admin/products/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        productApplicationService.delete(id);
        return Result.success();
    }

    @Operation(summary = "更新商品状态（上架/下架）")
    @PatchMapping("/api/admin/products/{id}/status")
    public Result<ProductDTO> updateStatus(@PathVariable("id") Long id,
                                           @RequestBody UpdateProductStatusRequest request) {
        request.setId(id);
        return Result.success(productApplicationService.updateStatus(request));
    }

    @Operation(summary = "扣减库存（内部，兑换调用）")
    @PostMapping("/api/internal/products/deduct-stock")
    public Result<ProductDTO> deductStock(@RequestBody @Valid StockRequest request) {
        return Result.success(productApplicationService.deductStock(request.getProductId(), request.getQuantity()));
    }

    @Operation(summary = "回补库存（内部，Saga 补偿调用）")
    @PostMapping("/api/internal/products/restore-stock")
    public Result<ProductDTO> restoreStock(@RequestBody @Valid StockRequest request) {
        return Result.success(productApplicationService.restoreStock(request.getProductId(), request.getQuantity()));
    }
}
