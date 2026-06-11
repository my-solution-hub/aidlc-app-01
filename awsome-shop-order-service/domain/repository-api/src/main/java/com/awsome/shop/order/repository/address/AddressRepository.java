package com.awsome.shop.order.repository.address;

import com.awsome.shop.order.domain.model.address.AddressEntity;
import java.util.List;

public interface AddressRepository {
    List<AddressEntity> listByUser(Long userId);
    AddressEntity getById(Long id);
    AddressEntity save(AddressEntity entity);
    void update(AddressEntity entity);
    void deleteById(Long id);
    /** 取消该用户其他默认地址 */
    void clearDefault(Long userId);
}
