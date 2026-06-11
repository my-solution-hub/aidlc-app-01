package com.awsome.shop.order.domain.model.address;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AddressEntity {
    private Long id;
    private Long userId;
    private String receiver;
    private String phone;
    private String region;
    private String detail;
    private String postalCode;
    private Integer isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
