package com.awsome.shop.order.domain.service.address;

import com.awsome.shop.order.domain.model.address.AddressEntity;
import java.util.List;

public interface AddressDomainService {
    List<AddressEntity> list(Long userId);
    AddressEntity create(AddressEntity entity);
    AddressEntity update(AddressEntity entity);
    void delete(Long id);
}
