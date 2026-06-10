package com.awsome.shop.point.application.api.dto.account.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 积分调整请求（内部/管理员）
 *
 * <p>direction: ADD 增加 / DEDUCT 扣减 / INIT 初始化</p>
 */
@Data
public class AdjustPointRequest {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotNull(message = "积分数量不能为空")
    private Integer amount;

    /** 操作方向：ADD / DEDUCT / INIT */
    private String direction = "ADD";

    /** 流水类型，例如 PERFORMANCE/HOLIDAY/REDEEM/ADJUST */
    private String type = "ADJUST";

    private String description;
}
