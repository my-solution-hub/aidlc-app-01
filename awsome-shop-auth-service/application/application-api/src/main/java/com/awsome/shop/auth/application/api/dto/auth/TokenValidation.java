package com.awsome.shop.auth.application.api.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Token 校验结果（网关鉴权调用）。
 *
 * <p>token 有效时 {@code valid=true} 并携带 {@code operatorId} 与 {@code role}；
 * 无效时 {@code valid=false}，其余字段为 null。</p>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidation {

    private boolean valid;

    private String operatorId;

    private String role;

    public static TokenValidation invalid() {
        return new TokenValidation(false, null, null);
    }

    public static TokenValidation valid(String operatorId, String role) {
        return new TokenValidation(true, operatorId, role);
    }
}
