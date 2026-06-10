package com.awsome.shop.order.facade.http.controller;

import com.awsome.shop.order.application.api.dto.exchange.ExchangeRecordDTO;
import com.awsome.shop.order.application.api.dto.exchange.ExchangeRecordStatsDTO;
import com.awsome.shop.order.application.api.dto.exchange.request.ExchangeRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.GetExchangeRecordRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.ListExchangeRecordRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.ListMyExchangeRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.UpdateExchangeStatusRequest;
import com.awsome.shop.order.application.api.service.exchange.ExchangeRecordApplicationService;
import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 积分兑换记录 Controller
 */
@Tag(name = "ExchangeRecord", description = "积分兑换记录管理")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExchangeRecordController {

    private final ExchangeRecordApplicationService exchangeRecordApplicationService;

    // ==================== 管理端接口 ====================

    @Operation(summary = "查询兑换记录详情")
    @GetMapping("/admin/orders/{id}")
    public Result<ExchangeRecordDTO> get(@PathVariable Long id) {
        GetExchangeRecordRequest request = new GetExchangeRecordRequest();
        request.setId(id);
        return Result.success(exchangeRecordApplicationService.get(request));
    }

    @Operation(summary = "分页查询兑换记录")
    @GetMapping("/admin/orders")
    public Result<PageResult<ExchangeRecordDTO>> list(@ModelAttribute @Valid ListExchangeRecordRequest request) {
        return Result.success(exchangeRecordApplicationService.list(request));
    }

    @Operation(summary = "兑换记录统计")
    @GetMapping("/admin/orders/stats")
    public Result<ExchangeRecordStatsDTO> stats() {
        return Result.success(exchangeRecordApplicationService.stats());
    }

    @Operation(summary = "更新兑换记录状态")
    @PutMapping("/admin/orders/{id}/status")
    public Result<ExchangeRecordDTO> updateStatus(@PathVariable Long id,
                                                  @RequestBody UpdateExchangeStatusRequest request) {
        request.setId(id);
        return Result.success(exchangeRecordApplicationService.updateStatus(request));
    }

    // ==================== 员工端公开接口 ====================

    @Operation(summary = "员工兑换下单")
    @PostMapping("/orders")
    public Result<ExchangeRecordDTO> exchange(@RequestBody @Valid ExchangeRequest request) {
        return Result.success(exchangeRecordApplicationService.exchange(request));
    }

    @Operation(summary = "员工查询自己的兑换记录")
    @GetMapping("/orders")
    public Result<PageResult<ExchangeRecordDTO>> listMine(@ModelAttribute @Valid ListMyExchangeRequest request) {
        return Result.success(exchangeRecordApplicationService.listMine(request));
    }

    @Operation(summary = "员工查询兑换记录详情")
    @GetMapping("/orders/{id}")
    public Result<ExchangeRecordDTO> getMine(@PathVariable Long id) {
        GetExchangeRecordRequest request = new GetExchangeRecordRequest();
        request.setId(id);
        return Result.success(exchangeRecordApplicationService.get(request));
    }
}
