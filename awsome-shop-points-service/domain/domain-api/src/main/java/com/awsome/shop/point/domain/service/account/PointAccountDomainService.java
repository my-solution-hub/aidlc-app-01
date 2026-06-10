package com.awsome.shop.point.domain.service.account;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.account.PointAccountEntity;
import com.awsome.shop.point.domain.model.account.PointGrantStatsEntity;
import com.awsome.shop.point.domain.model.account.PointTransactionEntity;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 积分账户领域服务接口
 */
public interface PointAccountDomainService {

    /** 查询账户余额（不存在则自动创建零余额账户） */
    PointAccountEntity getOrCreate(Long userId);

    /** 查询所有已有账户的用户ID（供定时发放使用） */
    List<Long> listAllUserIds();

    /** 注册初始化积分（被 auth 服务调用） */
    PointAccountEntity init(Long userId, int initialPoints);

    /** 扣减积分（被 order 兑换调用），余额不足抛异常 */
    PointAccountEntity deduct(Long userId, int amount, String description);

    /** 增加积分（发放/退回） */
    PointAccountEntity add(Long userId, int amount, String type, String description);

    /** 分页查询流水 */
    PageResult<PointTransactionEntity> pageTransactions(Long userId, int page, int size, String type);

    /** 分页查询积分账户（管理端员工积分列表），userId 为可选精确过滤 */
    PageResult<PointAccountEntity> pageAccounts(int page, int size, Long userId);

    /**
     * 管理端手动调整积分（type=ADJUST）。
     *
     * <p>amount 为正则增加，为负则扣减；扣减后余额不足抛 INSUFFICIENT_BALANCE 且不写入。</p>
     */
    PointAccountEntity adjustByAdmin(Long userId, int amount, String reason);

    /** 统计 [start, end) 区间内的自动发放情况（type=DISTRIBUTION） */
    PointGrantStatsEntity statDistribution(LocalDateTime start, LocalDateTime end);
}
