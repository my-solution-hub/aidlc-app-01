package com.awsome.shop.gateway.common.constants;

/**
 * Gateway route constants
 */
public final class RouteConstants {

    private RouteConstants() {
    }

    // ==================== Header Names ====================

    public static final String HEADER_REQUEST_ID = "X-Request-Id";
    public static final String HEADER_OPERATOR_ID = "X-Operator-Id";
    public static final String HEADER_AUTHORIZATION = "Authorization";

    // ==================== Route Metadata Keys ====================

    public static final String METADATA_AUTH_REQUIRED = "auth-required";

    // ==================== Path Prefixes ====================

    public static final String PATH_PREFIX_PUBLIC = "/api/v1/public/";
    public static final String PATH_PREFIX_DOCS = "/v3/api-docs/";

    // ==================== Gateway Attributes ====================

    public static final String ATTR_REQUEST_ID = "requestId";
    public static final String ATTR_OPERATOR_ID = "operatorId";
    public static final String ATTR_REQUEST_START_TIME = "requestStartTime";
}
