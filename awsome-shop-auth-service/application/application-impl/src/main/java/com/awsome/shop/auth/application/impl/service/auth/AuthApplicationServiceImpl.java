package com.awsome.shop.auth.application.impl.service.auth;

import com.awsome.shop.auth.application.api.dto.auth.LoginRequest;
import com.awsome.shop.auth.application.api.dto.auth.LoginResponse;
import com.awsome.shop.auth.application.api.service.auth.AuthApplicationService;
import com.awsome.shop.auth.domain.model.user.UserEntity;
import com.awsome.shop.auth.domain.service.auth.AuthDomainService;
import com.awsome.shop.auth.infrastructure.security.api.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 认证应用服务实现
 */
@Service
@RequiredArgsConstructor
public class AuthApplicationServiceImpl implements AuthApplicationService {

    private final AuthDomainService authDomainService;
    private final JwtService jwtService;

    @Override
    public LoginResponse login(LoginRequest request) {
        UserEntity user = authDomainService.login(request.getUsername(), request.getPassword());

        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getRole());

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setNickname(user.getNickname());
        response.setRole(user.getRole());
        return response;
    }

    @Override
    public void logout(String token) {
        authDomainService.logout(token);
    }

    @Override
    public String validateToken(String token) {
        return authDomainService.validateToken(token);
    }
}
