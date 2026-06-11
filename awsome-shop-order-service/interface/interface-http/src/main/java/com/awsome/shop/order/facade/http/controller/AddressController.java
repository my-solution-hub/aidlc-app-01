package com.awsome.shop.order.facade.http.controller;

import com.awsome.shop.order.application.api.dto.address.AddressDTO;
import com.awsome.shop.order.application.api.dto.address.AddressRequest;
import com.awsome.shop.order.application.api.service.address.AddressApplicationService;
import com.awsome.shop.order.facade.http.response.Result;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 收货地址簿(登录用户) */
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressApplicationService addressApplicationService;

    @Operation(summary = "我的收货地址列表")
    @GetMapping
    public Result<List<AddressDTO>> list(@RequestParam("userId") Long userId) {
        return Result.success(addressApplicationService.list(userId));
    }

    @Operation(summary = "新增收货地址")
    @PostMapping
    public Result<AddressDTO> create(@RequestBody @Valid AddressRequest request) {
        return Result.success(addressApplicationService.create(request));
    }

    @Operation(summary = "更新收货地址")
    @PutMapping("/{id}")
    public Result<AddressDTO> update(@PathVariable Long id, @RequestBody @Valid AddressRequest request) {
        request.setId(id);
        return Result.success(addressApplicationService.update(request));
    }

    @Operation(summary = "删除收货地址")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        addressApplicationService.delete(id);
        return Result.success(null);
    }
}
