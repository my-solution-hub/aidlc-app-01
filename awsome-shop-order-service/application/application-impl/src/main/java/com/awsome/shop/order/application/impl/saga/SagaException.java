package com.awsome.shop.order.application.impl.saga;

/**
 * Saga 流程异常
 *
 * <p>用于标记跨服务兑换流程中某一步骤失败，便于编排层触发补偿。</p>
 */
public class SagaException extends RuntimeException {

    public SagaException(String message) {
        super(message);
    }

    public SagaException(String message, Throwable cause) {
        super(message, cause);
    }
}
