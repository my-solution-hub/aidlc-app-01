package com.awsome.shop.order.bootstrap.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * WebClient 配置
 *
 * <p>为兑换流程跨服务 HTTP 调用提供 {@link WebClient.Builder}。
 * 在 servlet 应用中需显式声明该 Bean。</p>
 */
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
