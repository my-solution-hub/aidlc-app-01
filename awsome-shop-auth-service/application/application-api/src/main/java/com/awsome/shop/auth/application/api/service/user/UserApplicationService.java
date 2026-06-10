package com.awsome.shop.auth.application.api.service.user;

import com.awsome.shop.auth.application.api.dto.auth.CurrentUserRequest;
import com.awsome.shop.auth.application.api.dto.auth.RegisterRequest;
import com.awsome.shop.auth.application.api.dto.user.UserDTO;
import com.awsome.shop.auth.application.api.dto.user.request.CreateUserRequest;
import com.awsome.shop.auth.application.api.dto.user.request.GetUserRequest;
import com.awsome.shop.auth.application.api.dto.user.request.ListUserRequest;
import com.awsome.shop.auth.application.api.dto.user.request.UpdateUserRequest;
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

    /** 获取当前登录用户（解析 token 或使用注入的 userId） */
    UserDTO currentUser(CurrentUserRequest request);

    /** 查询用户详情 */
    UserDTO get(GetUserRequest request);

    /** 更新用户可变信息（昵称、角色、工号） */
    UserDTO update(UpdateUserRequest request);
}
