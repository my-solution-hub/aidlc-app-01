package com.awsome.shop.auth.application.api.service.user;

import com.awsome.shop.auth.application.api.dto.auth.RegisterRequest;
import com.awsome.shop.auth.application.api.dto.user.UserDTO;
import com.awsome.shop.auth.application.api.dto.user.request.CreateUserRequest;
import com.awsome.shop.auth.application.api.dto.user.request.ListUserRequest;
import com.awsome.shop.auth.application.api.dto.user.request.UpdateUserStatusRequest;
import com.awsome.shop.auth.common.dto.PageResult;

/**
 * 用户管理应用服务接口
 */
public interface UserApplicationService {

    PageResult<UserDTO> list(ListUserRequest request);

    UserDTO register(RegisterRequest request);

    UserDTO create(CreateUserRequest request);

    UserDTO updateStatus(UpdateUserStatusRequest request);
}
