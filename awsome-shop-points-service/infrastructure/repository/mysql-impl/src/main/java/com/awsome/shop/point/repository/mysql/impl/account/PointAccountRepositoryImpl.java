package com.awsome.shop.point.repository.mysql.impl.account;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.account.PointAccountEntity;
import com.awsome.shop.point.domain.model.account.PointTransactionEntity;
import com.awsome.shop.point.repository.account.PointAccountRepository;
import com.awsome.shop.point.repository.mysql.mapper.account.PointAccountMapper;
import com.awsome.shop.point.repository.mysql.mapper.account.PointTransactionMapper;
import com.awsome.shop.point.repository.mysql.po.account.PointAccountPO;
import com.awsome.shop.point.repository.mysql.po.account.PointTransactionPO;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 积分账户仓储实现（Adapter）
 */
@Repository
@RequiredArgsConstructor
public class PointAccountRepositoryImpl implements PointAccountRepository {

    private final PointAccountMapper accountMapper;
    private final PointTransactionMapper transactionMapper;

    @Override
    public PointAccountEntity findByUserId(Long userId) {
        PointAccountPO po = accountMapper.selectByUserId(userId);
        return po == null ? null : toEntity(po);
    }

    @Override
    public List<Long> findAllUserIds() {
        return accountMapper.selectAllUserIds();
    }

    @Override
    public PointAccountEntity create(PointAccountEntity account) {
        PointAccountPO po = new PointAccountPO();
        po.setUserId(account.getUserId());
        po.setBalance(account.getBalance());
        po.setTotalEarned(account.getTotalEarned());
        po.setTotalUsed(account.getTotalUsed());
        accountMapper.insert(po);
        return toEntity(po);
    }

    @Override
    public void updateBalance(PointAccountEntity account) {
        PointAccountPO po = accountMapper.selectById(account.getId());
        po.setBalance(account.getBalance());
        po.setTotalEarned(account.getTotalEarned());
        po.setTotalUsed(account.getTotalUsed());
        accountMapper.updateById(po);
    }

    @Override
    public void insertTransaction(PointTransactionEntity transaction) {
        PointTransactionPO po = new PointTransactionPO();
        po.setUserId(transaction.getUserId());
        po.setType(transaction.getType());
        po.setAmount(transaction.getAmount());
        po.setBalance(transaction.getBalance());
        po.setDescription(transaction.getDescription());
        transactionMapper.insert(po);
    }

    @Override
    public PageResult<PointTransactionEntity> pageTransactions(Long userId, int page, int size, String type) {
        IPage<PointTransactionPO> result =
                transactionMapper.selectPageByUser(new Page<>(page, size), userId, type);
        PageResult<PointTransactionEntity> pageResult = new PageResult<>();
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setTotal(result.getTotal());
        pageResult.setPages(result.getPages());
        pageResult.setRecords(result.getRecords().stream().map(this::toTxnEntity).collect(Collectors.toList()));
        return pageResult;
    }

    private PointAccountEntity toEntity(PointAccountPO po) {
        PointAccountEntity entity = new PointAccountEntity();
        entity.setId(po.getId());
        entity.setUserId(po.getUserId());
        entity.setBalance(po.getBalance());
        entity.setTotalEarned(po.getTotalEarned());
        entity.setTotalUsed(po.getTotalUsed());
        entity.setCreatedAt(po.getCreatedAt());
        entity.setUpdatedAt(po.getUpdatedAt());
        return entity;
    }

    private PointTransactionEntity toTxnEntity(PointTransactionPO po) {
        PointTransactionEntity entity = new PointTransactionEntity();
        entity.setId(po.getId());
        entity.setUserId(po.getUserId());
        entity.setType(po.getType());
        entity.setAmount(po.getAmount());
        entity.setBalance(po.getBalance());
        entity.setDescription(po.getDescription());
        entity.setCreatedAt(po.getCreatedAt());
        return entity;
    }
}
