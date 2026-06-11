package com.awsome.shop.auth.domain.impl.service.user;

import com.awsome.shop.auth.common.dto.PageResult;
import com.awsome.shop.auth.common.enums.AuthErrorCode;
import com.awsome.shop.auth.common.exception.BusinessException;
import com.awsome.shop.auth.domain.model.user.UserEntity;
import com.awsome.shop.auth.domain.service.user.UserDomainService;
import com.awsome.shop.auth.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 用户领域服务实现
 */
@Service
@RequiredArgsConstructor
public class UserDomainServiceImpl implements UserDomainService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public PageResult<UserEntity> page(int page, int size, String username, String role, String status) {
        return userRepository.page(page, size, username, role, status);
    }

    @Override
    public UserEntity create(String username, String password, String nickname, String employeeId, String role) {
        if (userRepository.findByUsername(username) != null) {
            throw new BusinessException(AuthErrorCode.USERNAME_ALREADY_EXISTS);
        }
        if (employeeId != null && !employeeId.isBlank()
                && userRepository.findByEmployeeId(employeeId) != null) {
            throw new BusinessException(AuthErrorCode.EMPLOYEE_ID_ALREADY_EXISTS);
        }

        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setNickname(nickname);
        user.setEmployeeId(employeeId == null || employeeId.isBlank() ? null : employeeId);
        user.setRole(role == null || role.isBlank() ? "EMPLOYEE" : role);
        user.setStatus("ACTIVE");
        user.setFailedLoginAttempts(0);

        userRepository.save(user);
        return user;
    }

    @Override
    public UserEntity getById(Long userId) {
        UserEntity user = userRepository.findById(userId);
        if (user == null) {
            throw new BusinessException(AuthErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    @Override
    public UserEntity update(Long userId, String nickname, String role, String employeeId, String department) {
        UserEntity user = userRepository.findById(userId);
        if (user == null) {
            throw new BusinessException(AuthErrorCode.USER_NOT_FOUND);
        }

        if (nickname != null && !nickname.isBlank()) {
            user.setNickname(nickname);
        }
        if (role != null && !role.isBlank()) {
            user.setRole(role);
        }
        if (employeeId != null && !employeeId.isBlank()
                && !employeeId.equals(user.getEmployeeId())) {
            UserEntity existing = userRepository.findByEmployeeId(employeeId);
            if (existing != null && !existing.getId().equals(userId)) {
                throw new BusinessException(AuthErrorCode.EMPLOYEE_ID_ALREADY_EXISTS);
            }
            user.setEmployeeId(employeeId);
        }
        if (department != null) {
            user.setDepartment(department.isBlank() ? null : department);
        }

        userRepository.update(user);
        return user;
    }

    @Override
    public UserEntity updateStatus(Long userId, String status) {
        UserEntity user = userRepository.findById(userId);
        if (user == null) {
            throw new BusinessException(AuthErrorCode.USER_NOT_FOUND);
        }

        user.setStatus(status);
        userRepository.update(user);
        return user;
    }

    @Override
    public long[] countStats() {
        return userRepository.countStats();
    }
}
