package com.awsome.shop.order.bootstrap.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 容忍多种 ISO 时间格式的 String -> LocalDateTime 转换器（用于 query 参数绑定）。
 *
 * <p>前端 / Swagger 默认发送的是带时区的 ISO-8601（如 {@code 2026-06-10T11:44:49.942Z}），
 * Spring 默认的 LocalDateTime 绑定无法解析尾部的 {@code Z} 或时区偏移而抛 400。
 * 这里按优先级依次尝试：带偏移的 OffsetDateTime（取本地时间部分）、标准 LocalDateTime、
 * 纯日期 LocalDate（补 00:00）。无法解析时返回 null（交由业务层按"无过滤条件"处理）。</p>
 */
@Configuration
public class LocalDateTimeConverterConfig {

    @Bean
    public Converter<String, LocalDateTime> stringToLocalDateTimeConverter() {
        return new Converter<>() {
            @Override
            public LocalDateTime convert(String source) {
                if (source == null || source.isBlank()) {
                    return null;
                }
                String s = source.trim();
                // 1) 带时区偏移或 Z 结尾：2026-06-10T11:44:49.942Z / +08:00
                try {
                    return OffsetDateTime.parse(s).toLocalDateTime();
                } catch (Exception ignored) {
                    // fall through
                }
                // 2) 标准本地时间：2026-06-10T11:44:49(.942)
                try {
                    return LocalDateTime.parse(s, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } catch (Exception ignored) {
                    // fall through
                }
                // 3) 纯日期：2026-06-10 -> 当天 00:00
                try {
                    return LocalDate.parse(s, DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
                } catch (Exception ignored) {
                    // fall through
                }
                return null;
            }
        };
    }
}
