package com.awsome.shop.auth.facade.http.controller;

import com.awsome.shop.auth.application.api.dto.auth.TokenValidation;
import com.awsome.shop.auth.application.api.service.auth.AuthApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * 内部认证 Controller —— 供 API 网关校验 JWT 使用。
 *
 * <p>注意：网关用 WebClient 直接 bodyToMono(AuthValidateResponse) 解析，
 * 因此本端点返回的是「裸 JSON」{success, operatorId, message}，
 * 不使用统一的 Result 信封。</p>
 */
@Tag(name = "InternalAuth", description = "内部认证（网关校验）")
@RestController
@RequiredArgsConstructor
public class InternalAuthController {

    private final AuthApplicationService authApplicationService;

    @Operation(summary = "校验 Token（网关调用）")
    @PostMapping("/api/internal/auth/validate")
    public ValidateResponse validate(@RequestBody ValidateRequest request) {
        TokenValidation result = authApplicationService.validateTokenDetail(request.getToken());
        if (result.isValid()) {
            return new ValidateResponse(true, result.getOperatorId(), result.getRole(), "OK");
        }
        return new ValidateResponse(false, null, null, "Token 无效或已过期");
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidateRequest {
        private String token;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidateResponse {
        private boolean success;
        private String operatorId;
        private String role;
        private String message;
    }
}
