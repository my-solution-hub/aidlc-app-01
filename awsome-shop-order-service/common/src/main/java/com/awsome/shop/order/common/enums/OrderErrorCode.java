package com.awsome.shop.order.common.enums;

/**
 * 订单/兑换业务错误码
 *
 * <p>用于员工兑换下单流程及跨服务 Saga 补偿场景。</p>
 */
public enum OrderErrorCode implements ErrorCode {

    /**
     * 商品不存在
     */
    PRODUCT_NOT_FOUND("NOT_FOUND_002", "商品不存在"),

    /**
     * 库存扣减失败
     */
    DEDUCT_STOCK_FAILED("CONFLICT_002", "库存扣减失败: {0}"),

    /**
     * 积分扣减失败
     */
    DEDUCT_POINTS_FAILED("CONFLICT_003", "积分扣减失败: {0}"),

    /**
     * 兑换记录持久化失败
     */
    EXCHANGE_PERSIST_FAILED("SYS_002", "兑换记录保存失败"),

    /**
     * 远程服务调用失败
     */
    REMOTE_CALL_FAILED("SYS_003", "远程服务调用失败: {0}"),

    /**
     * 兑换记录状态非法
     */
    INVALID_EXCHANGE_STATUS("PARAM_001", "非法的兑换记录状态: {0}");

    private final String code;
    private final String message;

    OrderErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
