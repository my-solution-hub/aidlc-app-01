package com.awsome.shop.order.application.api.service.exchange;

import com.awsome.shop.order.application.api.dto.exchange.ExchangeRecordDTO;
import com.awsome.shop.order.application.api.dto.exchange.ExchangeRecordStatsDTO;
import com.awsome.shop.order.application.api.dto.exchange.request.ExchangeRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.GetExchangeRecordRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.ListExchangeRecordRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.ListMyExchangeRequest;
import com.awsome.shop.order.application.api.dto.exchange.request.UpdateExchangeStatusRequest;
import com.awsome.shop.order.common.dto.PageResult;

/**
 * 积分兑换记录 应用服务接口
 */
public interface ExchangeRecordApplicationService {

    ExchangeRecordDTO get(GetExchangeRecordRequest request);

    PageResult<ExchangeRecordDTO> list(ListExchangeRecordRequest request);

    ExchangeRecordStatsDTO stats();

    /**
     * 更新兑换记录状态（及可选物流单号）
     */
    ExchangeRecordDTO updateStatus(UpdateExchangeStatusRequest request);

    /**
     * 员工兑换下单（跨服务 Saga）
     */
    ExchangeRecordDTO exchange(ExchangeRequest request);

    /**
     * 员工查询自己的兑换记录（分页）
     */
    PageResult<ExchangeRecordDTO> listMine(ListMyExchangeRequest request);

    /** 员工确认收货(DELIVERING -> COMPLETED) */
    ExchangeRecordDTO confirmReceipt(Long id, Long userId);
}
