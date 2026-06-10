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
    public static final String HEADER_USER_ROLE = "X-User-Role";
    public static final String HEADER_AUTHORIZATION = "Authorization";

    // ==================== Authorization ====================

    /** Path segment marking an ADMIN_ONLY endpoint. */
    public static final String PATH_SEGMENT_ADMIN = "/admin/";
    /** Required role for ADMIN_ONLY endpoints. */
    public static final String ROLE_ADMIN = "ADMIN";

    // ==================== Route Metadata Keys ====================

    public static final String METADATA_AUTH_REQUIRED = "auth-required";

    // ==================== Path Prefixes ====================

    public static final String PATH_PREFIX_DOCS = "/v3/api-docs/";

    // ==================== Gateway Attributes ====================

    public static final String ATTR_REQUEST_ID = "requestId";
    public static final String ATTR_OPERATOR_ID = "operatorId";
    public static final String ATTR_REQUEST_START_TIME = "requestStartTime";
}
