package com.awsome.shop.point.facade.http.controller;

import com.awsome.shop.point.application.api.dto.pointrule.PointRuleDTO;
import com.awsome.shop.point.application.api.dto.pointrule.request.CreatePointRuleRequest;
import com.awsome.shop.point.application.api.dto.pointrule.request.ListPointRuleRequest;
import com.awsome.shop.point.application.api.dto.pointrule.request.UpdatePointRuleRequest;
import com.awsome.shop.point.application.api.dto.pointrule.request.UpdatePointRuleStatusRequest;
import com.awsome.shop.point.application.api.service.pointrule.PointRuleApplicationService;
import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 积分规则管理 Controller
 */
@Tag(name = "PointRule", description = "积分规则管理")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PointRuleController {

    private final PointRuleApplicationService pointRuleApplicationService;

    @Operation(summary = "分页查询积分规则")
    @GetMapping("/admin/point-rules")
    public Result<PageResult<PointRuleDTO>> list(@ModelAttribute @Valid ListPointRuleRequest request) {
        return Result.success(pointRuleApplicationService.list(request));
    }

    @Operation(summary = "创建积分规则")
    @PostMapping("/admin/point-rules")
    public Result<PointRuleDTO> create(@RequestBody @Valid CreatePointRuleRequest request) {
        return Result.success(pointRuleApplicationService.create(request));
    }

    @Operation(summary = "更新积分规则")
    @PutMapping("/admin/point-rules/{id}")
    public Result<PointRuleDTO> update(@PathVariable Long id, @RequestBody @Valid UpdatePointRuleRequest request) {
        request.setId(id);
        return Result.success(pointRuleApplicationService.update(request));
    }

    @Operation(summary = "启用/禁用积分规则")
    @PatchMapping("/admin/point-rules/{id}/status")
    public Result<PointRuleDTO> updateStatus(@PathVariable Long id, @RequestBody @Valid UpdatePointRuleStatusRequest request) {
        request.setId(id);
        return Result.success(pointRuleApplicationService.updateStatus(request));
    }
}
