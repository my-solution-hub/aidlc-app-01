package com.awsome.shop.order.domain.impl.service.address;

import com.awsome.shop.order.domain.model.address.AddressEntity;
import com.awsome.shop.order.domain.service.address.AddressDomainService;
import com.awsome.shop.order.repository.address.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressDomainServiceImpl implements AddressDomainService {

    private final AddressRepository addressRepository;

    @Override
    public List<AddressEntity> list(Long userId) {
        return addressRepository.listByUser(userId);
    }

    @Override
    @Transactional
    public AddressEntity create(AddressEntity entity) {
        if (entity.getIsDefault() != null && entity.getIsDefault() == 1) {
            addressRepository.clearDefault(entity.getUserId());
        }
        return addressRepository.save(entity);
    }

    @Override
    @Transactional
    public AddressEntity update(AddressEntity entity) {
        AddressEntity existing = addressRepository.getById(entity.getId());
        if (existing == null) {
            throw new IllegalArgumentException("地址不存在");
        }
        if (entity.getIsDefault() != null && entity.getIsDefault() == 1) {
            addressRepository.clearDefault(existing.getUserId());
        }
        addressRepository.update(entity);
        return addressRepository.getById(entity.getId());
    }

    @Override
    public void delete(Long id) {
        addressRepository.deleteById(id);
    }
}
