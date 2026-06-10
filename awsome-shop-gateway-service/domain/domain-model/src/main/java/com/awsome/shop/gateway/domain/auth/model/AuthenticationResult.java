package com.awsome.shop.gateway.domain.auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Authentication result value object
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResult {

    private boolean authenticated;

    private String operatorId;

    private String message;

    public static AuthenticationResult success(String operatorId) {
        return AuthenticationResult.builder()
                .authenticated(true)
                .operatorId(operatorId)
                .build();
    }

    public static AuthenticationResult failure(String message) {
        return AuthenticationResult.builder()
                .authenticated(false)
                .message(message)
                .build();
    }
}
