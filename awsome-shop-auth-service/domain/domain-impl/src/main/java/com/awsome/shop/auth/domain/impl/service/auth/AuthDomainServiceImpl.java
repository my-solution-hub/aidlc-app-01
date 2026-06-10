package com.awsome.shop.auth.domain.impl.service.auth;

import com.awsome.shop.auth.common.enums.AuthErrorCode;
import com.awsome.shop.auth.common.exception.BusinessException;
import com.awsome.shop.auth.domain.model.user.UserEntity;
import com.awsome.shop.auth.domain.service.auth.AuthDomainService;
import com.awsome.shop.auth.infrastructure.cache.api.service.TokenCacheService;
import com.awsome.shop.auth.infrastructure.security.api.service.JwtService;
import com.awsome.shop.auth.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 认证领域服务实现
 */
@Service
@RequiredArgsConstructor
public class AuthDomainServiceImpl implements AuthDomainService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final TokenCacheService tokenCacheService;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${security.login.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${security.login.lock-duration:1800}")
    private long lockDurationSeconds;

    @Override
    public UserEntity login(String username, String password) {
        UserEntity user = userRepository.findByUsername(username);
        if (user == null) {
            throw new BusinessException(AuthErrorCode.INVALID_CREDENTIALS);
        }

        // 检查账户是否被禁用
        if ("DISABLED".equals(user.getStatus())) {
            throw new BusinessException(AuthErrorCode.ACCOUNT_DISABLED);
        }

        // 检查账户是否被锁定
        if (user.isLocked()) {
            long remainingMinutes = java.time.Duration.between(
                    java.time.LocalDateTime.now(), user.getLockExpiredAt()).toMinutes() + 1;
            throw new BusinessException(AuthErrorCode.ACCOUNT_LOCKED, String.valueOf(remainingMinutes));
        }

        // 如果锁定已过期，重置状态
        if ("LOCKED".equals(user.getStatus()) && !user.isLocked()) {
            user.setStatus("ACTIVE");
            user.setFailedLoginAttempts(0);
            user.setLockExpiredAt(null);
        }

        // 验证密码
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            user.recordLoginFailure(maxFailedAttempts, lockDurationSeconds);
            userRepository.update(user);
            throw new BusinessException(AuthErrorCode.INVALID_CREDENTIALS);
        }

        // 登录成功
        user.recordLoginSuccess();
        userRepository.update(user);

        return user;
    }

    @Override
    public void logout(String token) {
        if (token != null && jwtService.validateToken(token)) {
            tokenCacheService.addToBlacklist(token, jwtService.getExpirationSeconds());
        }
    }

    @Override
    public String validateToken(String token) {
        if (token == null || !jwtService.validateToken(token)) {
            return null;
        }
        // 已登出（黑名单）的 token 视为无效
        if (tokenCacheService.isBlacklisted(token)) {
            return null;
        }
        return String.valueOf(jwtService.getUserIdFromToken(token));
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        UserEntity user = userRepository.findById(userId);
        if (user == null) {
            throw new BusinessException(AuthErrorCode.USER_NOT_FOUND);
        }
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new BusinessException(AuthErrorCode.INVALID_CREDENTIALS);
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.update(user);
    }

    @Override
    public String refreshToken(String token) {
        if (token == null || !jwtService.validateToken(token)) {
            throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
        }
        if (tokenCacheService.isBlacklisted(token)) {
            throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
        }
        Long userId = jwtService.getUserIdFromToken(token);
        String username = jwtService.getUsernameFromToken(token);
        String role = jwtService.getRoleFromToken(token);

        // 旧 token 加入黑名单
        tokenCacheService.addToBlacklist(token, jwtService.getExpirationSeconds());

        // 签发新 token
        return jwtService.generateToken(userId, username, role);
    }
}
