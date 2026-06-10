package com.awsome.shop.product.facade.http.controller;

import com.awsome.shop.product.application.api.dto.category.CategoryDTO;
import com.awsome.shop.product.application.api.dto.category.request.CreateCategoryRequest;
import com.awsome.shop.product.application.api.dto.category.request.ListCategoryRequest;
import com.awsome.shop.product.application.api.dto.category.request.UpdateCategoryRequest;
import com.awsome.shop.product.application.api.dto.category.request.UpdateCategoryStatusRequest;
import com.awsome.shop.product.application.api.service.category.CategoryApplicationService;
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
 * 类目管理 Controller（RESTful）
 */
@Tag(name = "Category", description = "类目管理")
@RestController
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryApplicationService categoryApplicationService;

    @Operation(summary = "查询类目列表（树形结构）")
    @GetMapping("/api/categories/tree")
    public Result<List<CategoryDTO>> tree(@ModelAttribute ListCategoryRequest request) {
        return Result.success(categoryApplicationService.list(request));
    }

    @Operation(summary = "创建类目")
    @PostMapping("/api/admin/categories")
    public Result<CategoryDTO> create(@RequestBody @Valid CreateCategoryRequest request) {
        return Result.success(categoryApplicationService.create(request));
    }

    @Operation(summary = "更新类目")
    @PutMapping("/api/admin/categories/{id}")
    public Result<CategoryDTO> update(@PathVariable("id") Long id, @RequestBody UpdateCategoryRequest request) {
        request.setId(id);
        return Result.success(categoryApplicationService.update(request));
    }

    @Operation(summary = "删除类目")
    @DeleteMapping("/api/admin/categories/{id}")
    public Result<Void> delete(@PathVariable("id") Long id) {
        categoryApplicationService.delete(id);
        return Result.success();
    }

    @Operation(summary = "更新类目状态（启用/禁用）")
    @PatchMapping("/api/admin/categories/{id}/status")
    public Result<CategoryDTO> updateStatus(@PathVariable("id") Long id,
                                            @RequestBody UpdateCategoryStatusRequest request) {
        request.setId(id);
        return Result.success(categoryApplicationService.updateStatus(request));
    }
}
