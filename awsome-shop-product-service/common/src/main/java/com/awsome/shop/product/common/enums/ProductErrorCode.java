package com.awsome.shop.product.common.enums;

/**
 * 商品业务错误码
 */
public enum ProductErrorCode implements ErrorCode {

    /** 库存不足 */
    INSUFFICIENT_STOCK("CONFLICT_PRODUCT_001", "商品库存不足，当前库存 {0}，需要 {1}"),

    /** 数量非法 */
    INVALID_QUANTITY("PARAM_PRODUCT_001", "数量必须大于0");

    private final String code;
    private final String message;

    ProductErrorCode(String code, String message) {
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
