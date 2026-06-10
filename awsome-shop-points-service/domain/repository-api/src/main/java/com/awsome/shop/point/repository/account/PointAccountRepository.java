package com.awsome.shop.point.repository.account;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.account.PointAccountEntity;
import com.awsome.shop.point.domain.model.account.PointTransactionEntity;

/**
 * 积分账户仓储接口（Port）
 */
public interface PointAccountRepository {

    /** 按用户查询账户，不存在返回 null */
    PointAccountEntity findByUserId(Long userId);

    /** 创建账户 */
    PointAccountEntity create(PointAccountEntity account);

    /** 更新账户余额/累计（乐观锁） */
    void updateBalance(PointAccountEntity account);

    /** 新增一条流水 */
    void insertTransaction(PointTransactionEntity transaction);

    /** 分页查询用户流水 */
    PageResult<PointTransactionEntity> pageTransactions(Long userId, int page, int size, String type);
}
