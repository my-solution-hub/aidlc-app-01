package com.awsome.shop.order.repository.mysql.mapper.address;

import com.awsome.shop.order.repository.mysql.po.address.AddressPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AddressMapper extends BaseMapper<AddressPO> {
}
