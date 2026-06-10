package com.awsome.shop.gateway.common.exception;

import com.awsome.shop.gateway.common.enums.ErrorCode;

/**
 * Base gateway exception
 */
public class GatewayException extends BaseException {

    public GatewayException(ErrorCode errorCode) {
        super(errorCode);
    }

    public GatewayException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }

    public GatewayException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public GatewayException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(errorCode, customMessage, cause);
    }
}
