package com.awsome.shop.point.domain.service.account;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.account.PointAccountEntity;
import com.awsome.shop.point.domain.model.account.PointTransactionEntity;

/**
 * 积分账户领域服务接口
 */
public interface PointAccountDomainService {

    /** 查询账户余额（不存在则自动创建零余额账户） */
    PointAccountEntity getOrCreate(Long userId);

    /** 注册初始化积分（被 auth 服务调用） */
    PointAccountEntity init(Long userId, int initialPoints);

    /** 扣减积分（被 order 兑换调用），余额不足抛异常 */
    PointAccountEntity deduct(Long userId, int amount, String description);

    /** 增加积分（发放/退回） */
    PointAccountEntity add(Long userId, int amount, String type, String description);

    /** 分页查询流水 */
    PageResult<PointTransactionEntity> pageTransactions(Long userId, int page, int size, String type);
}
