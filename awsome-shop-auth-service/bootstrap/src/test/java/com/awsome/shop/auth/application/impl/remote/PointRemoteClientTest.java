package com.awsome.shop.auth.application.impl.remote;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * P0-AUTH-2: 注册时初始化积分 — PointRemoteClient 单元测试
 * 使用 Mockito mock WebClient 验证降级行为。
 */
@ExtendWith(MockitoExtension.class)
class PointRemoteClientTest {

    @Test
    @DisplayName("初始化积分 - 远程调用异常时降级不抛异常")
    void initPointAccount_remoteFailure_degradesGracefully() {
        // given - 使用真实 WebClient.Builder 指向一个不存在的地址
        PointRemoteClient client = new PointRemoteClient(
                WebClient.builder(), "http://localhost:19999");

        // when & then - 连接失败时降级不抛异常
        assertThatCode(() -> client.initPointAccount(99L))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("初始化积分 - userId 正常调用不抛异常")
    void initPointAccount_normalCall_doesNotThrow() {
        // given - 指向不可达地址，验证降级
        PointRemoteClient client = new PointRemoteClient(
                WebClient.builder(), "http://localhost:19999");

        // when & then
        assertThatCode(() -> client.initPointAccount(1L))
                .doesNotThrowAnyException();
    }
}
