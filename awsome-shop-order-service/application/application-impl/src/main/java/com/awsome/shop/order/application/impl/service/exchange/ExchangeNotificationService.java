package com.awsome.shop.order.application.impl.service.exchange;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 兑换通知服务 (ORD-8)
 *
 * <p>当前实现为日志通知（占位），预留邮件/站内信扩展点。
 * 后续可通过发布领域事件解耦通知逻辑。</p>
 */
@Slf4j
@Service
public class ExchangeNotificationService {

    /**
     * 兑换成功通知
     */
    public void notifyExchangeSuccess(Long userId, String orderNo, String productName) {
        log.info("[通知] 兑换成功: userId={}, orderNo={}, product={}",
                userId, orderNo, productName);
        // TODO: 接入邮件/站内信/推送服务
    }

    /**
     * 兑换状态变更通知
     */
    public void notifyStatusChange(Long userId, String orderNo, String newStatus) {
        log.info("[通知] 兑换状态变更: userId={}, orderNo={}, newStatus={}",
                userId, orderNo, newStatus);
        // TODO: 接入邮件/站内信/推送服务
    }
}
