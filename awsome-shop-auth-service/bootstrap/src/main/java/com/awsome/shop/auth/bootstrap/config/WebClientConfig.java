package com.awsome.shop.auth.bootstrap.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * WebClient 配置
 *
 * <p>为跨服务 HTTP 调用（如注册后初始化积分账户）提供 {@link WebClient.Builder}。
 * 在 servlet 应用中需显式声明该 Bean。</p>
 */
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
