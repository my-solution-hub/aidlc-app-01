package com.awsome.shop.point.domain.impl.service.account;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.common.enums.PointErrorCode;
import com.awsome.shop.point.common.exception.BusinessException;
import com.awsome.shop.point.domain.model.account.PointAccountEntity;
import com.awsome.shop.point.domain.model.account.PointTransactionEntity;
import com.awsome.shop.point.domain.service.account.PointAccountDomainService;
import com.awsome.shop.point.repository.account.PointAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 积分账户领域服务实现
 */
@Service
@RequiredArgsConstructor
public class PointAccountDomainServiceImpl implements PointAccountDomainService {

    private final PointAccountRepository repository;

    @Override
    public PointAccountEntity getOrCreate(Long userId) {
        PointAccountEntity account = repository.findByUserId(userId);
        if (account == null) {
            account = newAccount(userId, 0);
            account = repository.create(account);
        }
        return account;
    }

    @Override
    @Transactional
    public PointAccountEntity init(Long userId, int initialPoints) {
        PointAccountEntity account = repository.findByUserId(userId);
        if (account != null) {
            return account;
        }
        account = newAccount(userId, Math.max(0, initialPoints));
        account = repository.create(account);
        if (initialPoints > 0) {
            recordTransaction(userId, "INIT", initialPoints, account.getBalance(), "注册初始化积分");
        }
        return account;
    }

    @Override
    @Transactional
    public PointAccountEntity deduct(Long userId, int amount, String description) {
        if (amount <= 0) {
            throw new BusinessException(PointErrorCode.INVALID_AMOUNT);
        }
        PointAccountEntity account = getOrCreate(userId);
        if (account.getBalance() < amount) {
            throw new BusinessException(PointErrorCode.INSUFFICIENT_BALANCE,
                    (Object[]) new Object[]{account.getBalance(), amount});
        }
        account.setBalance(account.getBalance() - amount);
        account.setTotalUsed(account.getTotalUsed() + amount);
        repository.updateBalance(account);
        recordTransaction(userId, "REDEEM", -amount, account.getBalance(), description);
        return account;
    }

    @Override
    @Transactional
    public PointAccountEntity add(Long userId, int amount, String type, String description) {
        if (amount <= 0) {
            throw new BusinessException(PointErrorCode.INVALID_AMOUNT);
        }
        PointAccountEntity account = getOrCreate(userId);
        account.setBalance(account.getBalance() + amount);
        account.setTotalEarned(account.getTotalEarned() + amount);
        repository.updateBalance(account);
        recordTransaction(userId, type, amount, account.getBalance(), description);
        return account;
    }

    @Override
    public PageResult<PointTransactionEntity> pageTransactions(Long userId, int page, int size, String type) {
        return repository.pageTransactions(userId, page, size, type);
    }

    private PointAccountEntity newAccount(Long userId, int balance) {
        PointAccountEntity account = new PointAccountEntity();
        account.setUserId(userId);
        account.setBalance(balance);
        account.setTotalEarned(balance);
        account.setTotalUsed(0);
        return account;
    }

    private void recordTransaction(Long userId, String type, int amount, int balance, String description) {
        PointTransactionEntity txn = new PointTransactionEntity();
        txn.setUserId(userId);
        txn.setType(type);
        txn.setAmount(amount);
        txn.setBalance(balance);
        txn.setDescription(description);
        repository.insertTransaction(txn);
    }
}
