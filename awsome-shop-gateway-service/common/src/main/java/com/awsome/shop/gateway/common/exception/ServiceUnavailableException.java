package com.awsome.shop.gateway.common.exception;

import com.awsome.shop.gateway.common.enums.ErrorCode;

/**
 * Service unavailable exception (HTTP 503)
 */
public class ServiceUnavailableException extends GatewayException {

    public ServiceUnavailableException(ErrorCode errorCode) {
        super(errorCode);
    }

    public ServiceUnavailableException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }

    public ServiceUnavailableException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
}
