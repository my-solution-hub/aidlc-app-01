package com.awsome.shop.order.application.api.dto.address;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AddressDTO {
    private Long id;
    private Long userId;
    private String receiver;
    private String phone;
    private String region;
    private String detail;
    private String postalCode;
    private Integer isDefault;
    private LocalDateTime createdAt;
}
