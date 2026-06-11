package com.awsome.shop.point.application.api.dto.account;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分流水 DTO
 */
@Data
public class PointTransactionDTO {

    private Long id;

    private Long userId;

    private String type;

    private Integer amount;

    private Integer balance;

    private String description;

    private String operator;

    private LocalDateTime createdAt;
}
