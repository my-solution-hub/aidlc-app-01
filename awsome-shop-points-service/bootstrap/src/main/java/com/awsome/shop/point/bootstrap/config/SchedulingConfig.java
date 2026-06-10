package com.awsome.shop.point.bootstrap.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 定时任务配置类
 *
 * <p>开启 Spring 定时任务调度能力，供积分自动发放等任务使用。</p>
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
