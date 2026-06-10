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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 积分规则管理 Controller
 */
@Tag(name = "PointRule", description = "积分规则管理")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PointRuleController {

    private final PointRuleApplicationService pointRuleApplicationService;

    @Operation(summary = "分页查询积分规则")
    @PostMapping("/admin/point-rule/list")
    public Result<PageResult<PointRuleDTO>> list(@RequestBody @Valid ListPointRuleRequest request) {
        return Result.success(pointRuleApplicationService.list(request));
    }

    @Operation(summary = "创建积分规则")
    @PostMapping("/admin/point-rule/create")
    public Result<PointRuleDTO> create(@RequestBody @Valid CreatePointRuleRequest request) {
        return Result.success(pointRuleApplicationService.create(request));
    }

    @Operation(summary = "更新积分规则")
    @PostMapping("/admin/point-rule/update")
    public Result<PointRuleDTO> update(@RequestBody @Valid UpdatePointRuleRequest request) {
        return Result.success(pointRuleApplicationService.update(request));
    }

    @Operation(summary = "启用/禁用积分规则")
    @PostMapping("/admin/point-rule/update-status")
    public Result<PointRuleDTO> updateStatus(@RequestBody @Valid UpdatePointRuleStatusRequest request) {
        return Result.success(pointRuleApplicationService.updateStatus(request));
    }
}
