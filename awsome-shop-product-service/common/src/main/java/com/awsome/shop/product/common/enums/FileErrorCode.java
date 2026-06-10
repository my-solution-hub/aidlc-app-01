package com.awsome.shop.product.common.enums;

/**
 * 文件上传业务错误码
 *
 * <p>对应业务规则 BR-PROD-008 / FR-PROD-002 的文件校验。</p>
 * <p>使用 PARAM 前缀，HTTP 状态码映射为 400 Bad Request。</p>
 */
public enum FileErrorCode implements ErrorCode {

    /** 文件为空 (FILE_001) */
    FILE_EMPTY("PARAM_FILE_001", "文件不能为空"),

    /** 文件大小超过限制 (FILE_002) */
    FILE_TOO_LARGE("PARAM_FILE_002", "文件大小超过限制（最大 5MB）"),

    /** 不支持的文件类型 (FILE_003) */
    FILE_TYPE_NOT_SUPPORTED("PARAM_FILE_003", "不支持的文件类型，仅支持 jpg, jpeg, png, gif, webp");

    private final String code;
    private final String message;

    FileErrorCode(String code, String message) {
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
