package com.awsome.shop.auth.domain.impl.service.user;

import com.awsome.shop.auth.common.exception.BusinessException;
import com.awsome.shop.auth.domain.model.user.UserEntity;
import com.awsome.shop.auth.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * P0-AUTH-1: 用户注册领域服务单元测试
 */
@ExtendWith(MockitoExtension.class)
class UserDomainServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDomainServiceImpl userDomainService;

    @Nested
    @DisplayName("create - 用户注册")
    class CreateTests {

        @Test
        @DisplayName("注册成功 - 正常输入")
        void create_success() {
            // given
            when(userRepository.findByUsername("liming")).thenReturn(null);
            when(userRepository.findByEmployeeId("EMP001")).thenReturn(null);
            doAnswer(invocation -> {
                UserEntity user = invocation.getArgument(0);
                user.setId(1L);
                return null;
            }).when(userRepository).save(any(UserEntity.class));

            // when
            UserEntity result = userDomainService.create("liming", "Pass1234!", "李明", "EMP001", null);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getUsername()).isEqualTo("liming");
            assertThat(result.getNickname()).isEqualTo("李明");
            assertThat(result.getEmployeeId()).isEqualTo("EMP001");
            assertThat(result.getRole()).isEqualTo("EMPLOYEE");
            assertThat(result.getStatus()).isEqualTo("ACTIVE");
            assertThat(result.getFailedLoginAttempts()).isEqualTo(0);
            assertThat(result.getPasswordHash()).isNotEqualTo("Pass1234!");  // 密码已加密
            verify(userRepository).save(any(UserEntity.class));
        }

        @Test
        @DisplayName("注册失败 - 用户名已存在")
        void create_duplicateUsername_throwsException() {
            // given
            UserEntity existing = new UserEntity();
            existing.setUsername("liming");
            when(userRepository.findByUsername("liming")).thenReturn(existing);

            // when & then
            assertThatThrownBy(() -> userDomainService.create("liming", "Pass1234!", "李明", "EMP001", null))
                    .isInstanceOf(BusinessException.class);
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("注册失败 - 工号已存在")
        void create_duplicateEmployeeId_throwsException() {
            // given
            when(userRepository.findByUsername("newuser")).thenReturn(null);
            UserEntity existing = new UserEntity();
            existing.setEmployeeId("EMP001");
            when(userRepository.findByEmployeeId("EMP001")).thenReturn(existing);

            // when & then
            assertThatThrownBy(() -> userDomainService.create("newuser", "Pass1234!", "张三", "EMP001", null))
                    .isInstanceOf(BusinessException.class);
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("注册成功 - 默认角色为 EMPLOYEE")
        void create_defaultRoleIsEmployee() {
            // given
            when(userRepository.findByUsername(anyString())).thenReturn(null);

            // when
            UserEntity result = userDomainService.create("test", "Pass1234!", "测试", null, null);

            // then
            assertThat(result.getRole()).isEqualTo("EMPLOYEE");
        }

        @Test
        @DisplayName("注册成功 - 指定 ADMIN 角色")
        void create_withAdminRole() {
            // given
            when(userRepository.findByUsername(anyString())).thenReturn(null);

            // when
            UserEntity result = userDomainService.create("admin", "Pass1234!", "管理员", null, "ADMIN");

            // then
            assertThat(result.getRole()).isEqualTo("ADMIN");
        }

        @Test
        @DisplayName("注册成功 - 密码使用 BCrypt 加密")
        void create_passwordIsEncryptedWithBCrypt() {
            // given
            when(userRepository.findByUsername(anyString())).thenReturn(null);

            // when
            UserEntity result = userDomainService.create("user1", "plainPassword", "用户", null, null);

            // then
            assertThat(result.getPasswordHash()).startsWith("$2a$");  // BCrypt 前缀
            assertThat(result.getPasswordHash()).isNotEqualTo("plainPassword");
        }

        @Test
        @DisplayName("注册成功 - 工号为空时不校验唯一性")
        void create_nullEmployeeId_skipsUniquenessCheck() {
            // given
            when(userRepository.findByUsername(anyString())).thenReturn(null);

            // when
            UserEntity result = userDomainService.create("user2", "Pass1234!", "用户2", null, null);

            // then
            assertThat(result.getEmployeeId()).isNull();
            verify(userRepository, never()).findByEmployeeId(anyString());
        }
    }
}
