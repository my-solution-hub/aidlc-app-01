package com.awsome.shop.gateway.common.exception;

import com.awsome.shop.gateway.common.enums.ErrorCode;

/**
 * Authentication exception (HTTP 401)
 */
public class AuthenticationException extends GatewayException {

    public AuthenticationException(ErrorCode errorCode) {
        super(errorCode);
    }

    public AuthenticationException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }

    public AuthenticationException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
}
