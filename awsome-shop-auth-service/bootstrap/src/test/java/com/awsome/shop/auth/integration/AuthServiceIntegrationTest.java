package com.awsome.shop.auth.integration;

import com.awsome.shop.auth.application.api.dto.auth.LoginRequest;
import com.awsome.shop.auth.application.api.dto.auth.LoginResponse;
import com.awsome.shop.auth.application.api.service.auth.AuthApplicationService;
import com.awsome.shop.auth.bootstrap.Application;
import com.awsome.shop.auth.common.exception.BusinessException;
import com.awsome.shop.auth.domain.model.user.UserEntity;
import com.awsome.shop.auth.domain.service.auth.AuthDomainService;
import com.awsome.shop.auth.domain.service.user.UserDomainService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Auth Service 集成测试 — 真实 MySQL + Redis
 *
 * 覆盖: 注册→登录→Token校验→登出黑名单→密码修改→Token刷新
 */
@SpringBootTest(classes = Application.class)
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthServiceIntegrationTest {

    @Autowired
    private UserDomainService userDomainService;

    @Autowired
    private AuthDomainService authDomainService;

    @Autowired
    private AuthApplicationService authApplicationService;

    private static final String TEST_USERNAME = "itest_" + System.nanoTime();
    private static final String TEST_PASSWORD = "TestPass123!";
    private static String createdToken;

    @Test
    @Order(1)
    @DisplayName("注册 — 用户写入数据库，密码 BCrypt 加密")
    void register_createsUserInDatabase() {
        UserEntity user = userDomainService.create(TEST_USERNAME, TEST_PASSWORD, "集成测试用户", "EMP-IT-" + System.nanoTime(), null);

        assertThat(user.getId()).isNotNull();
        assertThat(user.getUsername()).isEqualTo(TEST_USERNAME);
        assertThat(user.getRole()).isEqualTo("EMPLOYEE");
        assertThat(user.getStatus()).isEqualTo("ACTIVE");
        assertThat(user.getPasswordHash()).startsWith("$2a$");  // BCrypt
        assertThat(user.getPasswordHash()).isNotEqualTo(TEST_PASSWORD);
    }

    @Test
    @Order(2)
    @DisplayName("注册重复用户名 — 抛异常")
    void register_duplicateUsername_throws() {
        assertThatThrownBy(() -> userDomainService.create(TEST_USERNAME, "AnotherPass1!", "重复", null, null))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @Order(3)
    @DisplayName("登录成功 — 返回 JWT Token")
    void login_correctCredentials_returnsToken() {
        LoginRequest request = new LoginRequest();
        request.setUsername(TEST_USERNAME);
        request.setPassword(TEST_PASSWORD);

        LoginResponse response = authApplicationService.login(request);

        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getUsername()).isEqualTo(TEST_USERNAME);
        assertThat(response.getRole()).isEqualTo("EMPLOYEE");

        createdToken = response.getToken();
    }

    @Test
    @Order(4)
    @DisplayName("登录失败 — 错误密码抛异常")
    void login_wrongPassword_throws() {
        LoginRequest request = new LoginRequest();
        request.setUsername(TEST_USERNAME);
        request.setPassword("WrongPassword!");

        assertThatThrownBy(() -> authApplicationService.login(request))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @Order(5)
    @DisplayName("Token 校验 — 有效 token 返回 userId")
    void validateToken_validToken_returnsUserId() {
        String userId = authDomainService.validateToken(createdToken);
        assertThat(userId).isNotNull();
    }

    @Test
    @Order(6)
    @DisplayName("登出 — Token 加入黑名单后校验失败")
    void logout_tokenBlacklisted_validationFails() {
        // 先登录获取新 token（不复用之前的，因为后续测试还需要）
        LoginRequest request = new LoginRequest();
        request.setUsername(TEST_USERNAME);
        request.setPassword(TEST_PASSWORD);
        LoginResponse response = authApplicationService.login(request);
        String tokenToLogout = response.getToken();

        // 验证 token 当前有效
        assertThat(authDomainService.validateToken(tokenToLogout)).isNotNull();

        // 登出
        authDomainService.logout(tokenToLogout);

        // 验证 token 已失效（黑名单）
        assertThat(authDomainService.validateToken(tokenToLogout)).isNull();
    }

    @Test
    @Order(7)
    @DisplayName("密码修改 — 旧密码验证 + 新密码生效")
    void changePassword_validOldPassword_succeeds() {
        String newPassword = "NewTestPass456!";

        // 先登录拿到 userId
        LoginRequest loginReq = new LoginRequest();
        loginReq.setUsername(TEST_USERNAME);
        loginReq.setPassword(TEST_PASSWORD);
        LoginResponse loginResp = authApplicationService.login(loginReq);

        // 修改密码
        authDomainService.changePassword(loginResp.getUserId(), TEST_PASSWORD, newPassword);

        // 用新密码登录成功
        LoginRequest newReq = new LoginRequest();
        newReq.setUsername(TEST_USERNAME);
        newReq.setPassword(newPassword);
        LoginResponse newResp = authApplicationService.login(newReq);
        assertThat(newResp.getToken()).isNotBlank();

        // 用旧密码登录失败
        assertThatThrownBy(() -> authApplicationService.login(loginReq))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @Order(8)
    @DisplayName("Token 刷新 — refreshToken 返回有效 token")
    void refreshToken_returnsValidToken() throws InterruptedException {
        // 等待 1 秒确保新 token 的 iat 不同
        Thread.sleep(1100);

        // 用当前密码登录获取新鲜 token
        LoginRequest request = new LoginRequest();
        request.setUsername(TEST_USERNAME);
        request.setPassword("NewTestPass456!");
        LoginResponse response = authApplicationService.login(request);
        String tokenForRefresh = response.getToken();

        // 刷新
        String newToken = authApplicationService.refreshToken(tokenForRefresh);

        // 核心断言：返回非空 token
        assertThat(newToken).isNotBlank();
    }
}
