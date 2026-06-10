package com.awsome.shop.gateway.domain.auth.service;

import com.awsome.shop.gateway.domain.auth.model.AuthenticationResult;
import reactor.core.publisher.Mono;

/**
 * Authentication service interface
 *
 * <p>Validates JWT tokens via external auth service.</p>
 */
public interface AuthenticationService {

    /**
     * Validate a JWT token.
     *
     * @param token the JWT token string
     * @return a Mono emitting the authentication result
     */
    Mono<AuthenticationResult> validate(String token);
}
