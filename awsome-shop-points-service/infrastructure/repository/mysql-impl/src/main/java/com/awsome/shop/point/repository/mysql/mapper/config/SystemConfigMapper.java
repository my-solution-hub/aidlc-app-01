package com.awsome.shop.point.repository.mysql.mapper.config;

import com.awsome.shop.point.repository.mysql.po.config.SystemConfigPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * 系统配置 Mapper
 */
@Mapper
public interface SystemConfigMapper extends BaseMapper<SystemConfigPO> {

    @Select("SELECT id, config_key, config_value, description, created_at, updated_at "
            + "FROM system_config WHERE config_key = #{configKey}")
    SystemConfigPO selectByConfigKey(@Param("configKey") String configKey);
}
