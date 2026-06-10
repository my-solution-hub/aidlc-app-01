package com.awsome.shop.point.application.api.service.account;

import com.awsome.shop.point.application.api.dto.account.PointAccountDTO;
import com.awsome.shop.point.application.api.dto.account.PointTransactionDTO;
import com.awsome.shop.point.application.api.dto.account.request.AdjustPointRequest;
import com.awsome.shop.point.application.api.dto.account.request.BalanceRequest;
import com.awsome.shop.point.application.api.dto.account.request.ListTransactionRequest;
import com.awsome.shop.point.common.dto.PageResult;

/**
 * 积分账户应用服务接口
 */
public interface PointAccountApplicationService {

    /** 查询积分余额（员工积分中心） */
    PointAccountDTO getBalance(BalanceRequest request);

    /** 分页查询积分流水 */
    PageResult<PointTransactionDTO> listTransactions(ListTransactionRequest request);

    /** 调整积分（内部接口：注册初始化 / 兑换扣减 / 管理员调整） */
    PointAccountDTO adjust(AdjustPointRequest request);
}
