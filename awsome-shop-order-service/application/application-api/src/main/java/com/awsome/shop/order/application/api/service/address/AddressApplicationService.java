package com.awsome.shop.order.application.api.service.address;

import com.awsome.shop.order.application.api.dto.address.AddressDTO;
import com.awsome.shop.order.application.api.dto.address.AddressRequest;
import java.util.List;

public interface AddressApplicationService {
    List<AddressDTO> list(Long userId);
    AddressDTO create(AddressRequest request);
    AddressDTO update(AddressRequest request);
    void delete(Long id);
}
