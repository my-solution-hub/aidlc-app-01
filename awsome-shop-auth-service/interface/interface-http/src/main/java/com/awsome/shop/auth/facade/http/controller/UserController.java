package com.awsome.shop.auth.facade.http.controller;

import com.awsome.shop.auth.application.api.dto.user.UserDTO;
import com.awsome.shop.auth.application.api.dto.user.request.CreateUserRequest;
import com.awsome.shop.auth.application.api.dto.user.request.GetUserRequest;
import com.awsome.shop.auth.application.api.dto.user.request.ListUserRequest;
import com.awsome.shop.auth.application.api.dto.user.request.UpdateUserRequest;
import com.awsome.shop.auth.application.api.dto.user.request.UpdateUserStatusRequest;
import com.awsome.shop.auth.application.api.service.user.UserApplicationService;
import com.awsome.shop.auth.common.dto.PageResult;
import com.awsome.shop.auth.common.result.Result;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户管理 Controller（管理员）
 */
@Tag(name = "User", description = "用户管理（管理员）")
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserApplicationService userApplicationService;

    @Operation(summary = "用户列表分页查询")
    @GetMapping
    public Result<PageResult<UserDTO>> list(@Valid @ModelAttribute ListUserRequest request) {
        return Result.success(userApplicationService.list(request));
    }

    @Operation(summary = "导出用户数据 CSV")
    @GetMapping("/export")
    public org.springframework.http.ResponseEntity<String> export() {
        ListUserRequest req = new ListUserRequest();
        req.setPage(1);
        req.setSize(10000);
        StringBuilder sb = new StringBuilder("﻿用户ID,用户名,昵称,工号,部门,角色,状态\n");
        for (UserDTO u : userApplicationService.list(req).getRecords()) {
            sb.append(u.getId()).append(',').append(nz(u.getUsername())).append(',')
              .append(nz(u.getNickname())).append(',').append(nz(u.getEmployeeId())).append(',')
              .append(nz(u.getDepartment())).append(',').append(nz(u.getRole())).append(',')
              .append(nz(u.getStatus())).append('\n');
        }
        return org.springframework.http.ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=users.csv")
                .header("Content-Type", "text/csv; charset=UTF-8")
                .body(sb.toString());
    }

    private static String nz(Object o) { return o == null ? "" : o.toString().replace(",", " "); }

    @Operation(summary = "用户统计（总数/活跃/本月新增）")
    @GetMapping("/stats")
    public Result<com.awsome.shop.auth.application.api.dto.user.UserStatsDTO> stats() {
        return Result.success(userApplicationService.stats());
    }

    @Operation(summary = "查询用户详情")
    @GetMapping("/{id}")
    public Result<UserDTO> get(@PathVariable("id") Long id) {
        GetUserRequest request = new GetUserRequest();
        request.setUserId(id);
        return Result.success(userApplicationService.get(request));
    }

    @Operation(summary = "创建用户（管理员）")
    @PostMapping
    public Result<UserDTO> create(@RequestBody @Valid CreateUserRequest request) {
        return Result.success(userApplicationService.create(request));
    }

    @Operation(summary = "更新用户信息（昵称/角色/工号）")
    @PutMapping("/{id}")
    public Result<UserDTO> update(@PathVariable("id") Long id,
                                  @RequestBody UpdateUserRequest request) {
        request.setUserId(id);
        return Result.success(userApplicationService.update(request));
    }

    @Operation(summary = "更新用户状态（启用/禁用）")
    @PatchMapping("/{id}/status")
    public Result<UserDTO> updateStatus(@PathVariable("id") Long id,
                                        @RequestBody UpdateUserStatusRequest request) {
        request.setUserId(id);
        return Result.success(userApplicationService.updateStatus(request));
    }
}
