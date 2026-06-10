package com.awsome.shop.gateway.domain.auth.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * JWT Bearer Token value object
 */
@Getter
@AllArgsConstructor
public class TokenInfo {

    private final String token;

    /**
     * Extract Bearer token from Authorization header value.
     *
     * @param authorizationHeader the full Authorization header (e.g. "Bearer xxx")
     * @return TokenInfo or null if the header is invalid
     */
    public static TokenInfo fromAuthorizationHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authorizationHeader.substring(7).trim();
        if (token.isEmpty()) {
            return null;
        }
        return new TokenInfo(token);
    }
}
