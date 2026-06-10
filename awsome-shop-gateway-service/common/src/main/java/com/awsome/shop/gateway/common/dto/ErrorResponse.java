package com.awsome.shop.gateway.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Gateway error response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private String code;

    private String message;

    private String requestId;

    private String path;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    public static ErrorResponse of(String code, String message, String requestId, String path) {
        return ErrorResponse.builder()
                .code(code)
                .message(message)
                .requestId(requestId)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
