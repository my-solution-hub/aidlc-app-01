package com.awsome.shop.product.facade.http.controller;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.dto.product.request.CreateProductRequest;
import com.awsome.shop.product.application.api.service.product.ProductApplicationService;
import com.awsome.shop.product.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 产品批量导入 Controller (PROD-5)
 *
 * <p>接受 JSON 数组格式的批量产品数据，最多 100 条/次。
 * 逐条创建，返回成功/失败汇总。</p>
 */
@Tag(name = "Product Batch", description = "产品批量操作")
@RestController
@RequiredArgsConstructor
@Slf4j
public class ProductBatchController {

    private static final int MAX_BATCH_SIZE = 100;

    private final ProductApplicationService productApplicationService;

    @Operation(summary = "批量导入产品（最多100条）")
    @PostMapping("/api/admin/products/batch")
    public Result<Map<String, Object>> batchImport(@RequestBody @Valid List<CreateProductRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return Result.success(Map.of("successCount", 0, "failCount", 0, "failures", List.of()));
        }
        if (requests.size() > MAX_BATCH_SIZE) {
            return Result.failure("PARAM_002", "批量导入最多支持 " + MAX_BATCH_SIZE + " 条记录");
        }

        int successCount = 0;
        List<Map<String, String>> failures = new ArrayList<>();

        for (int i = 0; i < requests.size(); i++) {
            try {
                productApplicationService.create(requests.get(i));
                successCount++;
            } catch (Exception e) {
                Map<String, String> failure = new HashMap<>();
                failure.put("index", String.valueOf(i));
                failure.put("name", requests.get(i).getName());
                failure.put("reason", e.getMessage());
                failures.add(failure);
                log.warn("批量导入第 {} 条失败: {}", i, e.getMessage());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("failCount", failures.size());
        result.put("failures", failures);
        return Result.success(result);
    }
}
