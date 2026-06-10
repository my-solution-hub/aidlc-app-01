package com.awsome.shop.point.application.api.dto.account.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 分页查询积分流水请求
 */
@Data
public class ListTransactionRequest {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    private Integer page = 1;

    private Integer size = 20;

    /** 流水类型筛选（可空） */
    private String type;
}
