package com.awsome.shop.point.application.impl.service.account;

import com.awsome.shop.point.application.api.dto.account.PointAccountDTO;
import com.awsome.shop.point.application.api.dto.account.PointBalanceDTO;
import com.awsome.shop.point.application.api.dto.account.PointTransactionDTO;
import com.awsome.shop.point.application.api.dto.account.UserPointDTO;
import com.awsome.shop.point.application.api.dto.account.request.AdjustPointRequest;
import com.awsome.shop.point.application.api.dto.account.request.AdminAdjustPointRequest;
import com.awsome.shop.point.application.api.dto.account.request.BalanceRequest;
import com.awsome.shop.point.application.api.dto.account.request.ListTransactionRequest;
import com.awsome.shop.point.application.api.dto.account.request.ListUserPointRequest;
import com.awsome.shop.point.application.api.service.account.PointAccountApplicationService;
import com.awsome.shop.point.application.impl.remote.UserRemoteClient;
import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.account.PointAccountEntity;
import com.awsome.shop.point.domain.model.account.PointTransactionEntity;
import com.awsome.shop.point.domain.service.account.PointAccountDomainService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 积分账户应用服务实现
 */
@Service
@RequiredArgsConstructor
public class PointAccountApplicationServiceImpl implements PointAccountApplicationService {

    private final PointAccountDomainService domainService;
    private final UserRemoteClient userRemoteClient;

    @Override
    public PointAccountDTO getBalance(BalanceRequest request) {
        return toDTO(domainService.getOrCreate(request.getUserId()));
    }

    @Override
    public PageResult<PointTransactionDTO> listTransactions(ListTransactionRequest request) {
        PageResult<PointTransactionEntity> page = domainService.pageTransactions(
                request.getUserId(), request.getPage(), request.getSize(), request.getType());
        return page.convert(this::toTxnDTO);
    }

    @Override
    public PointAccountDTO adjust(AdjustPointRequest request) {
        String direction = request.getDirection() == null ? "ADD" : request.getDirection().toUpperCase();
        String desc = request.getDescription();
        PointAccountEntity account;
        switch (direction) {
            case "DEDUCT":
                account = domainService.deduct(request.getUserId(), request.getAmount(), desc);
                break;
            case "INIT":
                account = domainService.init(request.getUserId(), request.getAmount());
                break;
            case "ADD":
            default:
                account = domainService.add(request.getUserId(), request.getAmount(),
                        request.getType() == null ? "ADJUST" : request.getType(), desc);
                break;
        }
        return toDTO(account);
    }

    @Override
    public PageResult<UserPointDTO> listUserPoints(ListUserPointRequest request) {
        Long userId = parseKeyword(request.getKeyword());
        PageResult<PointAccountEntity> page =
                domainService.pageAccounts(request.getPage(), request.getSize(), userId);
        return page.convert(this::toUserPointDTO);
    }

    @Override
    public PointBalanceDTO adminAdjust(AdminAdjustPointRequest request) {
        PointAccountEntity account = domainService.adjustByAdmin(
                request.getUserId(), request.getAmount(), request.getReason());
        PointBalanceDTO dto = new PointBalanceDTO();
        dto.setUserId(account.getUserId());
        dto.setBalance(account.getBalance());
        dto.setTotalEarned(account.getTotalEarned());
        dto.setTotalUsed(account.getTotalUsed());
        return dto;
    }

    /** keyword 为纯数字时解析为用户ID，否则忽略（返回 null） */
    private Long parseKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(keyword.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private UserPointDTO toUserPointDTO(PointAccountEntity entity) {
        UserPointDTO dto = new UserPointDTO();
        dto.setUserId(entity.getUserId());
        dto.setBalance(entity.getBalance());
        dto.setTotalEarned(entity.getTotalEarned());
        dto.setTotalUsed(entity.getTotalUsed());
        dto.setUpdatedAt(entity.getUpdatedAt());
        // 调 auth-service 充填 username/nickname/工号（失败降级，字段留空）
        JsonNode user = userRemoteClient.getUser(entity.getUserId());
        if (user != null) {
            dto.setUsername(textOrNull(user, "username"));
            dto.setNickname(textOrNull(user, "nickname"));
            dto.setEmployeeNo(textOrNull(user, "employeeId"));
        }
        return dto;
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return v == null || v.isNull() ? null : v.asText();
    }

    private PointAccountDTO toDTO(PointAccountEntity entity) {
        PointAccountDTO dto = new PointAccountDTO();
        dto.setUserId(entity.getUserId());
        dto.setBalance(entity.getBalance());
        dto.setTotalEarned(entity.getTotalEarned());
        dto.setTotalUsed(entity.getTotalUsed());
        return dto;
    }

    private PointTransactionDTO toTxnDTO(PointTransactionEntity entity) {
        PointTransactionDTO dto = new PointTransactionDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setType(entity.getType());
        dto.setAmount(entity.getAmount());
        dto.setBalance(entity.getBalance());
        dto.setDescription(entity.getDescription());
        dto.setOperator(entity.getOperator());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
