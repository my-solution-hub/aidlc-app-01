package com.awsome.shop.point.common.enums;

/**
 * 积分业务错误码
 */
public enum PointErrorCode implements ErrorCode {

    /** 积分余额不足 */
    INSUFFICIENT_BALANCE("CONFLICT_POINT_001", "积分余额不足，当前余额 {0}，需要 {1}"),

    /** 账户不存在 */
    ACCOUNT_NOT_FOUND("NOT_FOUND_POINT_001", "积分账户不存在"),

    /** 调整数量非法 */
    INVALID_AMOUNT("PARAM_POINT_001", "积分变动数量非法"),

    /** 积分规则不存在 */
    RULE_NOT_FOUND("NOT_FOUND_POINT_002", "积分规则不存在");

    private final String code;
    private final String message;

    PointErrorCode(String code, String message) {
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
