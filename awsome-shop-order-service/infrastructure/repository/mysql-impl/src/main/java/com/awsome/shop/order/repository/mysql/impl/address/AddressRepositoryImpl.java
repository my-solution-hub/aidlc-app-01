package com.awsome.shop.order.repository.mysql.impl.address;

import com.awsome.shop.order.domain.model.address.AddressEntity;
import com.awsome.shop.order.repository.address.AddressRepository;
import com.awsome.shop.order.repository.mysql.mapper.address.AddressMapper;
import com.awsome.shop.order.repository.mysql.po.address.AddressPO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class AddressRepositoryImpl implements AddressRepository {

    private final AddressMapper addressMapper;

    @Override
    public List<AddressEntity> listByUser(Long userId) {
        QueryWrapper<AddressPO> w = new QueryWrapper<>();
        w.eq("user_id", userId).orderByDesc("is_default", "id");
        return addressMapper.selectList(w).stream().map(this::toEntity).collect(Collectors.toList());
    }

    @Override
    public AddressEntity getById(Long id) {
        AddressPO po = addressMapper.selectById(id);
        return po == null ? null : toEntity(po);
    }

    @Override
    public AddressEntity save(AddressEntity entity) {
        AddressPO po = toPO(entity);
        addressMapper.insert(po);
        entity.setId(po.getId());
        return entity;
    }

    @Override
    public void update(AddressEntity entity) {
        addressMapper.updateById(toPO(entity));
    }

    @Override
    public void deleteById(Long id) {
        addressMapper.deleteById(id);
    }

    @Override
    public void clearDefault(Long userId) {
        UpdateWrapper<AddressPO> w = new UpdateWrapper<>();
        w.eq("user_id", userId).set("is_default", 0);
        addressMapper.update(null, w);
    }

    private AddressEntity toEntity(AddressPO po) {
        AddressEntity e = new AddressEntity();
        e.setId(po.getId()); e.setUserId(po.getUserId()); e.setReceiver(po.getReceiver());
        e.setPhone(po.getPhone()); e.setRegion(po.getRegion()); e.setDetail(po.getDetail());
        e.setPostalCode(po.getPostalCode()); e.setIsDefault(po.getIsDefault());
        e.setCreatedAt(po.getCreatedAt()); e.setUpdatedAt(po.getUpdatedAt());
        return e;
    }

    private AddressPO toPO(AddressEntity e) {
        AddressPO po = new AddressPO();
        po.setId(e.getId()); po.setUserId(e.getUserId()); po.setReceiver(e.getReceiver());
        po.setPhone(e.getPhone()); po.setRegion(e.getRegion()); po.setDetail(e.getDetail());
        po.setPostalCode(e.getPostalCode()); po.setIsDefault(e.getIsDefault());
        return po;
    }
}
