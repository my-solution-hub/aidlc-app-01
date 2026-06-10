package com.awsome.shop.point.application.impl.service.account;

import com.awsome.shop.point.application.api.dto.account.PointAccountDTO;
import com.awsome.shop.point.application.api.dto.account.PointTransactionDTO;
import com.awsome.shop.point.application.api.dto.account.request.AdjustPointRequest;
import com.awsome.shop.point.application.api.dto.account.request.BalanceRequest;
import com.awsome.shop.point.application.api.dto.account.request.ListTransactionRequest;
import com.awsome.shop.point.application.api.service.account.PointAccountApplicationService;
import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.account.PointAccountEntity;
import com.awsome.shop.point.domain.model.account.PointTransactionEntity;
import com.awsome.shop.point.domain.service.account.PointAccountDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 积分账户应用服务实现
 */
@Service
@RequiredArgsConstructor
public class PointAccountApplicationServiceImpl implements PointAccountApplicationService {

    private final PointAccountDomainService domainService;

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
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
