package com.awsome.shop.auth.application.impl.service.user;

import com.awsome.shop.auth.application.api.dto.auth.RegisterRequest;
import com.awsome.shop.auth.application.api.dto.user.UserDTO;
import com.awsome.shop.auth.application.api.dto.user.request.CreateUserRequest;
import com.awsome.shop.auth.application.api.dto.user.request.ListUserRequest;
import com.awsome.shop.auth.application.api.dto.user.request.UpdateUserStatusRequest;
import com.awsome.shop.auth.application.api.service.user.UserApplicationService;
import com.awsome.shop.auth.common.dto.PageResult;
import com.awsome.shop.auth.domain.model.user.UserEntity;
import com.awsome.shop.auth.domain.service.user.UserDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 用户管理应用服务实现
 *
 * <p>只依赖 Domain Service，不直接依赖 Repository</p>
 */
@Service
@RequiredArgsConstructor
public class UserApplicationServiceImpl implements UserApplicationService {

    private final UserDomainService userDomainService;

    @Override
    public PageResult<UserDTO> list(ListUserRequest request) {
        PageResult<UserEntity> page = userDomainService.page(
                request.getPage(), request.getSize(),
                request.getUsername(), request.getRole(), request.getStatus());
        return page.convert(this::toDTO);
    }

    @Override
    public UserDTO register(RegisterRequest request) {
        UserEntity user = userDomainService.create(
                request.getUsername(), request.getPassword(),
                request.getNickname(), request.getRole());
        return toDTO(user);
    }

    @Override
    public UserDTO create(CreateUserRequest request) {
        UserEntity user = userDomainService.create(
                request.getUsername(), request.getPassword(),
                request.getNickname(), request.getRole());
        return toDTO(user);
    }

    @Override
    public UserDTO updateStatus(UpdateUserStatusRequest request) {
        UserEntity user = userDomainService.updateStatus(request.getUserId(), request.getStatus());
        return toDTO(user);
    }

    private UserDTO toDTO(UserEntity entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setNickname(entity.getNickname());
        dto.setRole(entity.getRole());
        dto.setStatus(entity.getStatus());
        dto.setLastLoginAt(entity.getLastLoginAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
