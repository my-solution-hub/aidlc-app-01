package com.awsome.shop.point.facade.http.controller;

import com.awsome.shop.point.application.api.dto.account.PointAccountDTO;
import com.awsome.shop.point.application.api.dto.account.PointTransactionDTO;
import com.awsome.shop.point.application.api.dto.account.request.AdjustPointRequest;
import com.awsome.shop.point.application.api.dto.account.request.BalanceRequest;
import com.awsome.shop.point.application.api.dto.account.request.ListTransactionRequest;
import com.awsome.shop.point.application.api.service.account.PointAccountApplicationService;
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
 * 积分账户 Controller
 *
 * <p>员工端：余额查询、流水查询；内部：积分调整（初始化/扣减/发放）。</p>
 */
@Tag(name = "PointAccount", description = "积分账户")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PointAccountController {

    private final PointAccountApplicationService pointAccountApplicationService;

    @Operation(summary = "查询积分余额")
    @PostMapping("/public/point/balance")
    public Result<PointAccountDTO> balance(@RequestBody @Valid BalanceRequest request) {
        return Result.success(pointAccountApplicationService.getBalance(request));
    }

    @Operation(summary = "分页查询积分流水")
    @PostMapping("/public/point/transaction/list")
    public Result<PageResult<PointTransactionDTO>> transactions(@RequestBody @Valid ListTransactionRequest request) {
        return Result.success(pointAccountApplicationService.listTransactions(request));
    }

    @Operation(summary = "积分调整（内部/管理员）")
    @PostMapping("/internal/point/adjust")
    public Result<PointAccountDTO> adjust(@RequestBody @Valid AdjustPointRequest request) {
        return Result.success(pointAccountApplicationService.adjust(request));
    }
}
