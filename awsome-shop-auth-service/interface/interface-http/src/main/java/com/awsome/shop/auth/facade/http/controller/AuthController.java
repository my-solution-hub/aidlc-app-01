package com.awsome.shop.auth.facade.http.controller;

import com.awsome.shop.auth.application.api.dto.auth.CurrentUserRequest;
import com.awsome.shop.auth.application.api.dto.auth.ChangePasswordRequest;
import com.awsome.shop.auth.application.api.dto.auth.LoginRequest;
import com.awsome.shop.auth.application.api.dto.auth.LoginResponse;
import com.awsome.shop.auth.application.api.dto.auth.RegisterRequest;
import com.awsome.shop.auth.application.api.dto.user.UserDTO;
import com.awsome.shop.auth.application.api.service.auth.AuthApplicationService;
import com.awsome.shop.auth.application.api.service.user.UserApplicationService;
import com.awsome.shop.auth.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 认证 Controller
 */
@Tag(name = "Auth", description = "用户认证（登录/登出/注册/当前用户）")
@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthApplicationService authApplicationService;
    private final UserApplicationService userApplicationService;

    @Operation(summary = "用户登录")
    @PostMapping("/api/auth/login")
    public Result<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return Result.success(authApplicationService.login(request));
    }

    @Operation(summary = "用户注册")
    @PostMapping("/api/auth/register")
    public Result<UserDTO> register(@RequestBody @Valid RegisterRequest request) {
        return Result.success(userApplicationService.register(request));
    }

    @Operation(summary = "用户登出")
    @PostMapping("/api/auth/logout")
    public Result<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        String token = extractToken(authorization);
        if (token != null) {
            authApplicationService.logout(token);
        }
        return Result.success();
    }

    @Operation(summary = "获取当前登录用户信息")
    @GetMapping("/api/users/me")
    public Result<UserDTO> me(@RequestHeader(value = "Authorization", required = false) String authorization,
                              @RequestHeader(value = "X-Operator-Id", required = false) Long operatorId) {
        CurrentUserRequest request = new CurrentUserRequest();
        if (operatorId != null) {
            request.setUserId(operatorId);
        } else {
            request.setToken(extractToken(authorization));
        }
        return Result.success(userApplicationService.currentUser(request));
    }

    @Operation(summary = "修改密码 (AUTH-3)")
    @PutMapping("/api/auth/password")
    public Result<Void> changePassword(@RequestHeader(value = "X-Operator-Id") Long operatorId,
                                       @RequestBody @Valid ChangePasswordRequest request) {
        authApplicationService.changePassword(operatorId, request.getOldPassword(), request.getNewPassword());
        return Result.success();
    }

    @Operation(summary = "刷新 Token (AUTH-6)")
    @PostMapping("/api/auth/refresh")
    public Result<LoginResponse> refreshToken(@RequestHeader(value = "Authorization") String authorization) {
        String token = extractToken(authorization);
        String newToken = authApplicationService.refreshToken(token);
        LoginResponse response = new LoginResponse();
        response.setToken(newToken);
        return Result.success(response);
    }

    private String extractToken(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }
}
