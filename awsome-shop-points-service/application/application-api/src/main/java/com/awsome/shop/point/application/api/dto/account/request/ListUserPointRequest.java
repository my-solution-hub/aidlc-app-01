package com.awsome.shop.point.application.api.dto.account.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * 员工积分列表查询请求（管理端 US-020）
 */
@Data
public class ListUserPointRequest {

    @Min(value = 1, message = "页码最小为 1")
    private Integer page = 1;

    @Min(value = 1, message = "每页大小最小为 1")
    @Max(value = 100, message = "每页大小最大为 100")
    private Integer size = 20;

    /** 关键字过滤：为纯数字时按用户ID精确过滤，否则忽略 */
    private String keyword;
}
