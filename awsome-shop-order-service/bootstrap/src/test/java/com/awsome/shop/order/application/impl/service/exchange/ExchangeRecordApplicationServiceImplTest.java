package com.awsome.shop.order.application.impl.service.exchange;

import com.awsome.shop.order.application.api.dto.exchange.ExchangeRecordDTO;
import com.awsome.shop.order.application.api.dto.exchange.request.ExchangeRequest;
import com.awsome.shop.order.application.impl.saga.ExchangeRemoteClient;
import com.awsome.shop.order.application.impl.saga.SagaException;
import com.awsome.shop.order.common.exception.BusinessException;
import com.awsome.shop.order.domain.model.exchange.ExchangeRecordEntity;
import com.awsome.shop.order.domain.service.exchange.ExchangeRecordDomainService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

/**
 * P0-ORD-1/ORD-2: 兑换流程（含余额/库存校验 + Saga 补偿）单元测试
 */
@ExtendWith(MockitoExtension.class)
class ExchangeRecordApplicationServiceImplTest {

    @Mock
    private ExchangeRecordDomainService exchangeRecordDomainService;

    @Mock
    private ExchangeRemoteClient exchangeRemoteClient;

    @Mock
    private IdempotencyService idempotencyService;

    @Mock
    private ExchangeRateLimitService rateLimitService;

    @Mock
    private ExchangeNotificationService notificationService;

    @InjectMocks
    private ExchangeRecordApplicationServiceImpl service;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ExchangeRequest request;

    @BeforeEach
    void setUp() {
        request = new ExchangeRequest();
        request.setProductId(1L);
        request.setQuantity(1);
        request.setUserId(100L);
        request.setEmployeeName("李明");
        request.setIdempotencyKey("test-key-123");

        // Default: 幂等和限频均通过
        lenient().when(idempotencyService.tryAcquire(any())).thenReturn(true);
        lenient().when(rateLimitService.allowExchange(any())).thenReturn(true);
    }

    @Nested
    @DisplayName("exchange - 兑换核心流程")
    class ExchangeTests {

        @Test
        @DisplayName("兑换成功 - 完整 Saga 流程")
        void exchange_success_completeSaga() {
            // given - 商品存在，积分充足，库存充足
            ObjectNode productNode = objectMapper.createObjectNode();
            productNode.put("name", "Sony 耳机");
            productNode.put("pointsPrice", 500);
            productNode.put("imageUrl", "http://img.example.com/sony.jpg");
            productNode.put("description", "降噪耳机");
            when(exchangeRemoteClient.getProduct(1L)).thenReturn(productNode);

            doNothing().when(exchangeRemoteClient).deductPoints(100L, 500);
            doNothing().when(exchangeRemoteClient).deductStock(1L, 1);

            ExchangeRecordEntity savedEntity = buildSavedEntity();
            when(exchangeRecordDomainService.save(any())).thenReturn(savedEntity);

            // when
            ExchangeRecordDTO result = service.exchange(request);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getProductName()).isEqualTo("Sony 耳机");
            assertThat(result.getPointsCost()).isEqualTo(500);
            assertThat(result.getStatus()).isEqualTo("PENDING_DELIVERY");

            // 验证调用顺序
            verify(exchangeRemoteClient).getProduct(1L);
            verify(exchangeRemoteClient).deductPoints(100L, 500);
            verify(exchangeRemoteClient).deductStock(1L, 1);
            verify(exchangeRecordDomainService).save(any());
        }

        @Test
        @DisplayName("兑换失败 - 积分不足（步骤1失败，无补偿）")
        void exchange_insufficientPoints_noCompensation() {
            // given
            ObjectNode productNode = objectMapper.createObjectNode();
            productNode.put("name", "Sony 耳机");
            productNode.put("pointsPrice", 500);
            when(exchangeRemoteClient.getProduct(1L)).thenReturn(productNode);

            doThrow(new SagaException("积分不足"))
                    .when(exchangeRemoteClient).deductPoints(100L, 500);

            // when & then
            assertThatThrownBy(() -> service.exchange(request))
                    .isInstanceOf(BusinessException.class);

            // 验证：积分扣减失败，不应调用库存扣减，不应保存记录
            verify(exchangeRemoteClient, never()).deductStock(anyLong(), anyInt());
            verify(exchangeRecordDomainService, never()).save(any());
            // 不需要补偿（因为积分没有扣成功）
            verify(exchangeRemoteClient, never()).refundPoints(anyLong(), anyInt());
        }

        @Test
        @DisplayName("兑换失败 - 库存不足（步骤2失败，补偿积分）")
        void exchange_insufficientStock_compensatesPoints() {
            // given
            ObjectNode productNode = objectMapper.createObjectNode();
            productNode.put("name", "Sony 耳机");
            productNode.put("pointsPrice", 500);
            when(exchangeRemoteClient.getProduct(1L)).thenReturn(productNode);

            doNothing().when(exchangeRemoteClient).deductPoints(100L, 500);
            doThrow(new SagaException("库存不足"))
                    .when(exchangeRemoteClient).deductStock(1L, 1);

            // when & then
            assertThatThrownBy(() -> service.exchange(request))
                    .isInstanceOf(BusinessException.class);

            // 验证：Saga 补偿 — 退还积分
            verify(exchangeRemoteClient).refundPoints(100L, 500);
            // 不应保存记录
            verify(exchangeRecordDomainService, never()).save(any());
        }

        @Test
        @DisplayName("兑换失败 - 持久化失败（步骤3失败，补偿积分+库存）")
        void exchange_persistFailed_compensatesBoth() {
            // given
            ObjectNode productNode = objectMapper.createObjectNode();
            productNode.put("name", "Sony 耳机");
            productNode.put("pointsPrice", 500);
            when(exchangeRemoteClient.getProduct(1L)).thenReturn(productNode);

            doNothing().when(exchangeRemoteClient).deductPoints(100L, 500);
            doNothing().when(exchangeRemoteClient).deductStock(1L, 1);
            when(exchangeRecordDomainService.save(any()))
                    .thenThrow(new RuntimeException("DB connection lost"));

            // when & then
            assertThatThrownBy(() -> service.exchange(request))
                    .isInstanceOf(BusinessException.class);

            // 验证：Saga 补偿 — 退还积分 + 恢复库存
            verify(exchangeRemoteClient).refundPoints(100L, 500);
            verify(exchangeRemoteClient).restoreStock(1L, 1);
        }

        @Test
        @DisplayName("兑换失败 - 商品不存在")
        void exchange_productNotFound_throwsException() {
            // given
            when(exchangeRemoteClient.getProduct(999L))
                    .thenThrow(new SagaException("商品不存在: 999"));
            request.setProductId(999L);

            // when & then
            assertThatThrownBy(() -> service.exchange(request))
                    .isInstanceOf(SagaException.class);
            verify(exchangeRemoteClient, never()).deductPoints(anyLong(), anyInt());
        }

        @Test
        @DisplayName("兑换成功 - 数量>1时正确计算总积分")
        void exchange_multipleQuantity_calculatesCorrectCost() {
            // given
            request.setQuantity(3);
            ObjectNode productNode = objectMapper.createObjectNode();
            productNode.put("name", "咖啡券");
            productNode.put("pointsPrice", 50);
            when(exchangeRemoteClient.getProduct(1L)).thenReturn(productNode);

            doNothing().when(exchangeRemoteClient).deductPoints(100L, 150); // 50*3
            doNothing().when(exchangeRemoteClient).deductStock(1L, 3);

            ExchangeRecordEntity saved = buildSavedEntity();
            saved.setPointsCost(150);
            saved.setQuantity(3);
            when(exchangeRecordDomainService.save(any())).thenReturn(saved);

            // when
            ExchangeRecordDTO result = service.exchange(request);

            // then
            verify(exchangeRemoteClient).deductPoints(100L, 150);
            verify(exchangeRemoteClient).deductStock(1L, 3);
            assertThat(result.getPointsCost()).isEqualTo(150);
        }
    }

    private ExchangeRecordEntity buildSavedEntity() {
        ExchangeRecordEntity entity = new ExchangeRecordEntity();
        entity.setId(1L);
        entity.setOrderNo("EX1718000000000");
        entity.setProductId(1L);
        entity.setProductName("Sony 耳机");
        entity.setProductDesc("降噪耳机");
        entity.setProductImageUrl("http://img.example.com/sony.jpg");
        entity.setUserId(100L);
        entity.setEmployeeName("李明");
        entity.setQuantity(1);
        entity.setPointsCost(500);
        entity.setExchangeTime(LocalDateTime.now());
        entity.setStatus("PENDING_DELIVERY");
        return entity;
    }
}
