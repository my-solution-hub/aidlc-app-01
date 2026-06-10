package com.awsome.shop.point.facade.http.controller;

import com.awsome.shop.point.application.api.dto.config.DistributionConfigDTO;
import com.awsome.shop.point.application.api.dto.config.PointGrantStatsDTO;
import com.awsome.shop.point.application.api.dto.config.request.UpdateDistributionConfigRequest;
import com.awsome.shop.point.application.api.service.config.PointConfigApplicationService;
import com.awsome.shop.point.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 积分配置 Controller
 *
 * <p>管理员：获取/更新积分发放配置；内部：手动触发自动发放（便于测试）。</p>
 */
@Tag(name = "PointConfig", description = "积分发放配置")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PointConfigController {

    private final PointConfigApplicationService pointConfigApplicationService;

    @Operation(summary = "获取积分发放配置")
    @GetMapping("/admin/points/config")
    public Result<DistributionConfigDTO> getConfig() {
        return Result.success(pointConfigApplicationService.getDistributionConfig());
    }

    @Operation(summary = "更新积分发放配置")
    @PutMapping("/admin/points/config")
    public Result<DistributionConfigDTO> updateConfig(@RequestBody @Valid UpdateDistributionConfigRequest request) {
        return Result.success(pointConfigApplicationService.updateDistributionConfig(request));
    }

    @Operation(summary = "积分发放统计")
    @GetMapping("/admin/points/config/stats")
    public Result<PointGrantStatsDTO> getStats(@RequestParam(required = false) String month) {
        return Result.success(pointConfigApplicationService.getDistributionStats(month));
    }

    @Operation(summary = "手动触发积分自动发放（内部/测试）")
    @PostMapping("/internal/points/distribute")
    public Result<Integer> distribute() {
        return Result.success(pointConfigApplicationService.distributePointsToAll());
    }
}
