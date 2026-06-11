package com.awsome.shop.order.application.api.dto.address;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddressRequest {
    private Long id;
    @NotNull(message = "用户ID不能为空")
    private Long userId;
    @NotBlank(message = "收货人不能为空")
    private String receiver;
    @NotBlank(message = "手机号不能为空")
    private String phone;
    private String region;
    @NotBlank(message = "详细地址不能为空")
    private String detail;
    private String postalCode;
    private Integer isDefault;
}
