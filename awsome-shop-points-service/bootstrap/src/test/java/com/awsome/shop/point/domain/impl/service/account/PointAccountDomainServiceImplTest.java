package com.awsome.shop.point.domain.impl.service.account;

import com.awsome.shop.point.common.exception.BusinessException;
import com.awsome.shop.point.domain.model.account.PointAccountEntity;
import com.awsome.shop.point.domain.model.account.PointTransactionEntity;
import com.awsome.shop.point.repository.account.PointAccountRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * P0-PTS-1/PTS-2: 积分账户领域服务单元测试
 * 覆盖: 积分初始化、发放、扣减、防超扣
 */
@ExtendWith(MockitoExtension.class)
class PointAccountDomainServiceImplTest {

    @Mock
    private PointAccountRepository repository;

    @InjectMocks
    private PointAccountDomainServiceImpl service;

    // ===================== init (P0-AUTH-2: 注册时初始化积分) =====================

    @Nested
    @DisplayName("init - 积分账户初始化")
    class InitTests {

        @Test
        @DisplayName("初始化成功 - 新用户创建账户余额为0")
        void init_newUser_createsAccountWithZeroBalance() {
            // given
            when(repository.findByUserId(1L)).thenReturn(null);
            when(repository.create(any())).thenAnswer(inv -> {
                PointAccountEntity e = inv.getArgument(0);
                e.setId(1L);
                return e;
            });

            // when
            PointAccountEntity result = service.init(1L, 0);

            // then
            assertThat(result.getUserId()).isEqualTo(1L);
            assertThat(result.getBalance()).isEqualTo(0);
            assertThat(result.getTotalEarned()).isEqualTo(0);
            assertThat(result.getTotalUsed()).isEqualTo(0);
            verify(repository).create(any());
            verify(repository, never()).insertTransaction(any());  // 初始金额为0不记流水
        }

        @Test
        @DisplayName("初始化幂等 - 已有账户直接返回")
        void init_existingAccount_returnsWithoutCreating() {
            // given
            PointAccountEntity existing = buildAccount(1L, 100);
            when(repository.findByUserId(1L)).thenReturn(existing);

            // when
            PointAccountEntity result = service.init(1L, 0);

            // then
            assertThat(result.getBalance()).isEqualTo(100);
            verify(repository, never()).create(any());
        }
    }

    // ===================== add (P0-PTS-1: 积分定期自动发放) =====================

    @Nested
    @DisplayName("add - 积分发放")
    class AddTests {

        @Test
        @DisplayName("发放成功 - 余额增加并记录流水")
        void add_success_increasesBalanceAndRecordsTransaction() {
            // given
            PointAccountEntity account = buildAccount(1L, 500);
            when(repository.findByUserId(1L)).thenReturn(account);

            // when
            PointAccountEntity result = service.add(1L, 100, "DISTRIBUTION", "系统每月自动发放");

            // then
            assertThat(result.getBalance()).isEqualTo(600);
            assertThat(result.getTotalEarned()).isEqualTo(100);
            verify(repository).updateBalance(account);

            ArgumentCaptor<PointTransactionEntity> txnCaptor = ArgumentCaptor.forClass(PointTransactionEntity.class);
            verify(repository).insertTransaction(txnCaptor.capture());
            PointTransactionEntity txn = txnCaptor.getValue();
            assertThat(txn.getUserId()).isEqualTo(1L);
            assertThat(txn.getType()).isEqualTo("DISTRIBUTION");
            assertThat(txn.getAmount()).isEqualTo(100);
            assertThat(txn.getBalance()).isEqualTo(600);
            assertThat(txn.getDescription()).isEqualTo("系统每月自动发放");
        }

        @Test
        @DisplayName("发放失败 - 金额<=0抛异常")
        void add_zeroAmount_throwsException() {
            assertThatThrownBy(() -> service.add(1L, 0, "DISTRIBUTION", "test"))
                    .isInstanceOf(BusinessException.class);
            assertThatThrownBy(() -> service.add(1L, -5, "DISTRIBUTION", "test"))
                    .isInstanceOf(BusinessException.class);
        }
    }

    // ===================== deduct (P0-PTS-6: 积分防超扣) =====================

    @Nested
    @DisplayName("deduct - 积分扣减")
    class DeductTests {

        @Test
        @DisplayName("扣减成功 - 余额充足")
        void deduct_sufficientBalance_success() {
            // given
            PointAccountEntity account = buildAccount(1L, 500);
            when(repository.findByUserId(1L)).thenReturn(account);

            // when
            PointAccountEntity result = service.deduct(1L, 200, "兑换商品");

            // then
            assertThat(result.getBalance()).isEqualTo(300);
            assertThat(result.getTotalUsed()).isEqualTo(200);
            verify(repository).updateBalance(account);
            verify(repository).insertTransaction(any());
        }

        @Test
        @DisplayName("扣减失败 - 余额不足抛异常（防超扣）")
        void deduct_insufficientBalance_throwsException() {
            // given
            PointAccountEntity account = buildAccount(1L, 100);
            when(repository.findByUserId(1L)).thenReturn(account);

            // when & then
            assertThatThrownBy(() -> service.deduct(1L, 200, "兑换商品"))
                    .isInstanceOf(BusinessException.class);
            verify(repository, never()).updateBalance(any());
            verify(repository, never()).insertTransaction(any());
        }

        @Test
        @DisplayName("扣减失败 - 金额<=0抛异常")
        void deduct_invalidAmount_throwsException() {
            assertThatThrownBy(() -> service.deduct(1L, 0, "test"))
                    .isInstanceOf(BusinessException.class);
            assertThatThrownBy(() -> service.deduct(1L, -10, "test"))
                    .isInstanceOf(BusinessException.class);
        }

        @Test
        @DisplayName("扣减边界 - 余额恰好等于扣减金额")
        void deduct_exactBalance_success() {
            // given
            PointAccountEntity account = buildAccount(1L, 500);
            when(repository.findByUserId(1L)).thenReturn(account);

            // when
            PointAccountEntity result = service.deduct(1L, 500, "全部扣减");

            // then
            assertThat(result.getBalance()).isEqualTo(0);
        }
    }

    // ===================== listAllUserIds (P0-PTS-1: 定时发放遍历) =====================

    @Nested
    @DisplayName("listAllUserIds - 获取全部用户ID")
    class ListAllUserIdsTests {

        @Test
        @DisplayName("返回所有已有积分账户的用户ID")
        void listAllUserIds_returnsAllIds() {
            // given
            when(repository.findAllUserIds()).thenReturn(List.of(1L, 2L, 3L));

            // when
            List<Long> result = service.listAllUserIds();

            // then
            assertThat(result).containsExactly(1L, 2L, 3L);
        }
    }

    // ===================== 辅助方法 =====================

    private PointAccountEntity buildAccount(Long userId, int balance) {
        PointAccountEntity account = new PointAccountEntity();
        account.setId(1L);
        account.setUserId(userId);
        account.setBalance(balance);
        account.setTotalEarned(balance);
        account.setTotalUsed(0);
        return account;
    }
}
