# 技术栈与构建

## 运行时与语言
- Java 21
- Spring Boot 3.4.1
- Spring Cloud 2025.0.0

## 构建系统
- Maven（多模块 POM）
- Lombok 1.18.36（注解处理器）
- JaCoCo 代码覆盖率

## ORM 与数据库
- MyBatis-Plus 3.5.7（Spring Boot 3 starter）
- MySQL 8.4，使用 Druid 连接池
- Flyway 管理数据库迁移（脚本位于 `bootstrap/src/main/resources/db/migration/`）
- 迁移脚本命名：`V{number}__{description}.sql`

## 缓存
- Spring Data Redis，使用 Lettuce 客户端

## 消息队列
- AWS SQS（SDK 2.20.0）

## 安全
- JJWT 0.12.6（JWT 创建/验证）
- 认证在网关层统一处理

## API 文档
- SpringDoc OpenAPI（Swagger UI 访问地址：`/swagger-ui.html`）

## 可观测性
- Micrometer Tracing 1.3.5
- Logstash Logback Encoder 7.4
- Actuator 端点：health、info、prometheus

## 常用命令

```bash
# 全量构建（跳过测试）
mvn clean install -DskipTests

# 运行测试
mvn test

# 启动应用（local 配置）
mvn spring-boot:run -pl bootstrap

# 使用指定配置启动
mvn spring-boot:run -pl bootstrap -Dspring-boot.run.profiles=dev

# 构建单个模块
mvn clean install -pl domain/domain-model -am
```

## java -jar 启动

日志目录：`/tmp/awsome-shop/order/`

```bash
# 1. 构建可执行 jar
mvn clean package -DskipTests

# 2. 创建日志目录
mkdir -p /tmp/awsome-shop/order

# 3. 后台启动服务（local 配置，日志输出到 /tmp/awsome-shop/order/app.log）
nohup java -jar bootstrap/target/awsome-shop-order-service-1.0.0-SNAPSHOT.jar \
  --spring.profiles.active=local \
  > /tmp/awsome-shop/order/app.log 2>&1 &

# 4. 查看启动日志
tail -f /tmp/awsome-shop/order/app.log

# 5. 停止服务
kill $(lsof -t -i:8004)
```

## 环境配置
- `local`（默认）— 本地开发
- `dev` — 开发环境
- `docker` — Docker 部署
- `staging` — 预发布环境
- `prod` — 生产环境
- `test` — 测试环境
