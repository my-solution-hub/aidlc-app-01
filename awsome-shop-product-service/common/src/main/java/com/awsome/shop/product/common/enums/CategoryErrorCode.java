package com.awsome.shop.product.common.enums;

/**
 * 分类业务错误码
 *
 * <p>对应业务规则 BR-PROD-003 分类层级限制等。</p>
 */
public enum CategoryErrorCode implements ErrorCode {

    /** 超过分类层级限制（最大 2 级）(CAT_002) */
    LEVEL_EXCEEDED("PARAM_CATEGORY_001", "超过分类层级限制，最多支持 2 级分类");

    private final String code;
    private final String message;

    CategoryErrorCode(String code, String message) {
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
