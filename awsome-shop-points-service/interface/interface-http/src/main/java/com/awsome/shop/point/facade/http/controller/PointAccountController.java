package com.awsome.shop.point.facade.http.controller;

import com.awsome.shop.point.application.api.dto.account.PointAccountDTO;
import com.awsome.shop.point.application.api.dto.account.PointBalanceDTO;
import com.awsome.shop.point.application.api.dto.account.PointTransactionDTO;
import com.awsome.shop.point.application.api.dto.account.UserPointDTO;
import com.awsome.shop.point.application.api.dto.account.request.AdjustPointRequest;
import com.awsome.shop.point.application.api.dto.account.request.AdminAdjustPointRequest;
import com.awsome.shop.point.application.api.dto.account.request.BalanceRequest;
import com.awsome.shop.point.application.api.dto.account.request.ListTransactionRequest;
import com.awsome.shop.point.application.api.dto.account.request.ListUserPointRequest;
import com.awsome.shop.point.application.api.service.account.PointAccountApplicationService;
import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 积分账户 Controller
 *
 * <p>员工端：余额查询、流水查询；内部：积分调整（初始化/扣减/发放）。</p>
 */
@Tag(name = "PointAccount", description = "积分账户")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PointAccountController {

    private final PointAccountApplicationService pointAccountApplicationService;

    @Operation(summary = "查询积分余额")
    @GetMapping("/points/balance")
    public Result<PointAccountDTO> balance(@RequestParam Long userId) {
        BalanceRequest request = new BalanceRequest();
        request.setUserId(userId);
        return Result.success(pointAccountApplicationService.getBalance(request));
    }

    @Operation(summary = "分页查询积分流水")
    @GetMapping("/points/transactions")
    public Result<PageResult<PointTransactionDTO>> transactions(@ModelAttribute @Valid ListTransactionRequest request) {
        return Result.success(pointAccountApplicationService.listTransactions(request));
    }

    @Operation(summary = "积分调整（内部/管理员）")
    @PostMapping("/internal/points/adjust")
    public Result<PointAccountDTO> adjust(@RequestBody @Valid AdjustPointRequest request) {
        return Result.success(pointAccountApplicationService.adjust(request));
    }

    @Operation(summary = "员工积分列表（管理端）")
    @GetMapping("/admin/points/users")
    public Result<PageResult<UserPointDTO>> listUserPoints(@ModelAttribute @Valid ListUserPointRequest request) {
        return Result.success(pointAccountApplicationService.listUserPoints(request));
    }

    @Operation(summary = "管理端手动调整积分")
    @PostMapping("/admin/points/adjust")
    public Result<PointBalanceDTO> adminAdjust(@RequestBody @Valid AdminAdjustPointRequest request) {
        return Result.success(pointAccountApplicationService.adminAdjust(request));
    }
}
