package com.awsome.shop.gateway.application.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Auth validation response DTO from external auth service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthValidateResponse {

    private boolean success;

    private String operatorId;

    private String message;
}
