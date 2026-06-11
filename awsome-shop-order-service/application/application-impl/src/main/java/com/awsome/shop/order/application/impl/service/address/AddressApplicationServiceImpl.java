package com.awsome.shop.order.application.impl.service.address;

import com.awsome.shop.order.application.api.dto.address.AddressDTO;
import com.awsome.shop.order.application.api.dto.address.AddressRequest;
import com.awsome.shop.order.application.api.service.address.AddressApplicationService;
import com.awsome.shop.order.domain.model.address.AddressEntity;
import com.awsome.shop.order.domain.service.address.AddressDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressApplicationServiceImpl implements AddressApplicationService {

    private final AddressDomainService addressDomainService;

    @Override
    public List<AddressDTO> list(Long userId) {
        return addressDomainService.list(userId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public AddressDTO create(AddressRequest request) {
        return toDTO(addressDomainService.create(toEntity(request)));
    }

    @Override
    public AddressDTO update(AddressRequest request) {
        return toDTO(addressDomainService.update(toEntity(request)));
    }

    @Override
    public void delete(Long id) {
        addressDomainService.delete(id);
    }

    private AddressEntity toEntity(AddressRequest r) {
        AddressEntity e = new AddressEntity();
        e.setId(r.getId()); e.setUserId(r.getUserId()); e.setReceiver(r.getReceiver());
        e.setPhone(r.getPhone()); e.setRegion(r.getRegion()); e.setDetail(r.getDetail());
        e.setPostalCode(r.getPostalCode()); e.setIsDefault(r.getIsDefault());
        return e;
    }

    private AddressDTO toDTO(AddressEntity e) {
        AddressDTO d = new AddressDTO();
        d.setId(e.getId()); d.setUserId(e.getUserId()); d.setReceiver(e.getReceiver());
        d.setPhone(e.getPhone()); d.setRegion(e.getRegion()); d.setDetail(e.getDetail());
        d.setPostalCode(e.getPostalCode()); d.setIsDefault(e.getIsDefault());
        d.setCreatedAt(e.getCreatedAt());
        return d;
    }
}
