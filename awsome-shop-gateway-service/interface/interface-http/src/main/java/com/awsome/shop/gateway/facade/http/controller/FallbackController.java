package com.awsome.shop.gateway.facade.http.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * 熔断降级控制器 (GW-1)
 *
 * <p>当后端服务熔断打开时，Gateway 会将请求转发到此 fallback 端点，
 * 返回统一的服务不可用响应。</p>
 */
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/service-unavailable")
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, Object>> serviceUnavailable() {
        return Mono.just(Map.of(
                "code", 503,
                "message", "服务暂时不可用，请稍后重试",
                "data", Map.of()
        ));
    }
}
