package com.awsome.shop.auth.application.api.dto.auth;

import lombok.Data;

/**
 * 获取当前用户请求。
 *
 * <p>可携带 token（自行解析 userId），或由网关注入 userId。二者择一。</p>
 */
@Data
public class CurrentUserRequest {

    private String token;

    private Long userId;
}
