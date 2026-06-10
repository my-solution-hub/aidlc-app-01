package com.awsome.shop.gateway.application.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Auth validation request DTO sent to external auth service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthValidateRequest {

    private String token;
}
