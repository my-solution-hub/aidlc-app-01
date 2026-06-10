package com.awsome.shop.point.repository.account;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.account.PointAccountEntity;
import com.awsome.shop.point.domain.model.account.PointGrantStatsEntity;
import com.awsome.shop.point.domain.model.account.PointTransactionEntity;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 积分账户仓储接口（Port）
 */
public interface PointAccountRepository {

    /** 按用户查询账户，不存在返回 null */
    PointAccountEntity findByUserId(Long userId);

    /** 查询所有已有账户的用户ID */
    List<Long> findAllUserIds();

    /** 创建账户 */
    PointAccountEntity create(PointAccountEntity account);

    /** 更新账户余额/累计（乐观锁） */
    void updateBalance(PointAccountEntity account);

    /** 原子性扣减积分 (PTS-6)：通过 SQL WHERE balance >= amount 防止并发超扣 */
    boolean atomicDeduct(Long accountId, int amount);

    /** 新增一条流水 */
    void insertTransaction(PointTransactionEntity transaction);

    /** 分页查询用户流水 */
    PageResult<PointTransactionEntity> pageTransactions(Long userId, int page, int size, String type);

    /** 分页查询积分账户（管理端员工积分列表），keyword 为可选用户ID精确过滤 */
    PageResult<PointAccountEntity> pageAccounts(int page, int size, Long userId);

    /** 统计指定时间区间 [start, end) 内 type=DISTRIBUTION 的发放情况 */
    PointGrantStatsEntity statDistribution(LocalDateTime start, LocalDateTime end);
}
