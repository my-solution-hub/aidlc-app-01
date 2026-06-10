package com.awsome.shop.product.facade.http.controller;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.dto.product.request.CreateProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.GetProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.DeleteProductRequest;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 商品管理 Controller
 */
@Tag(name = "Product", description = "商品管理")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProductController {

    private final ProductApplicationService productApplicationService;

    @Operation(summary = "创建商品")
    @PostMapping("/public/product/create")
    public Result<ProductDTO> create(@RequestBody @Valid CreateProductRequest request) {
        return Result.success(productApplicationService.create(request));
    }

    @Operation(summary = "商品列表查询")
    @PostMapping("/public/product/list")
    public Result<PageResult<ProductDTO>> list(@RequestBody @Valid ListProductRequest request) {
        return Result.success(productApplicationService.list(request));
    }

    @Operation(summary = "商品详情查询")
    @PostMapping("/public/product/get")
    public Result<ProductDTO> get(@RequestBody @Valid GetProductRequest request) {
        return Result.success(productApplicationService.get(request.getId()));
    }

    @Operation(summary = "更新商品")
    @PostMapping("/public/product/update")
    public Result<ProductDTO> update(@RequestBody @Valid UpdateProductRequest request) {
        return Result.success(productApplicationService.update(request));
    }

    @Operation(summary = "删除商品")
    @PostMapping("/public/product/delete")
    public Result<Void> delete(@RequestBody @Valid DeleteProductRequest request) {
        productApplicationService.delete(request.getId());
        return Result.success();
    }

    @Operation(summary = "更新商品状态（上架/下架）")
    @PostMapping("/public/product/update-status")
    public Result<ProductDTO> updateStatus(@RequestBody @Valid UpdateProductStatusRequest request) {
        return Result.success(productApplicationService.updateStatus(request));
    }

    @Operation(summary = "扣减库存（内部，兑换调用）")
    @PostMapping("/internal/product/deduct-stock")
    public Result<ProductDTO> deductStock(@RequestBody @Valid StockRequest request) {
        return Result.success(productApplicationService.deductStock(request.getProductId(), request.getQuantity()));
    }

    @Operation(summary = "回补库存（内部，Saga 补偿调用）")
    @PostMapping("/internal/product/restore-stock")
    public Result<ProductDTO> restoreStock(@RequestBody @Valid StockRequest request) {
        return Result.success(productApplicationService.restoreStock(request.getProductId(), request.getQuantity()));
    }
}
