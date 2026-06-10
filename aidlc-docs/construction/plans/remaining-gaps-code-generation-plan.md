# 剩余缺口功能 — 代码生成计划

> **计划版本**: v1.0  
> **目标**: 实现复查报告 v2 中全部 10 项缺失功能  
> **依赖顺序**: SYS-1(基础) → GW-1(网关) → AUTH(认证) → PTS(积分) → ORD(订单) → PROD(产品)

---

## 执行步骤

### Phase 1: 系统基础设施（SYS-1）

- [x] **Step 1**: Gateway 限流配置 (GW-1)
  - 在 `awsome-shop-gateway-service/bootstrap/pom.xml` 添加 `spring-cloud-starter-circuitbreaker-reactor-resilience4j` 和 `spring-boot-starter-data-redis-reactive` 依赖
  - 创建 `RateLimitingConfig.java` 配置类，基于 Redis + RequestRateLimiter GatewayFilter
  - 在 `application-local.yml` 的路由中添加限流过滤器（replenishRate=10, burstCapacity=20）
  - 创建 `CircuitBreakerConfig.java` 熔断配置（failureRateThreshold=50%，waitDuration=30s）

### Phase 2: Auth Service 增强

- [x] **Step 2**: 密码修改端点 (AUTH-3)
- [x] **Step 3**: Token 刷新机制 (AUTH-6)

### Phase 3: Points Service 增强

- [x] **Step 4**: 积分防超扣原子性强化 (PTS-6)
  - 修改 `PointAccountMapper.xml` 的 `updateBalance` SQL，添加 `WHERE balance >= #{deductAmount}` 条件
  - 修改 `PointAccountRepositoryImpl.updateBalance()` 返回受影响行数
  - 修改 `PointAccountDomainServiceImpl.deduct()` 检查 updateBalance 返回值，若为 0 则抛出 `INSUFFICIENT_BALANCE`
  - 单元测试: 并发扣减场景模拟

### Phase 4: Order Service 增强

- [x] **Step 5**: Saga 幂等性保障 (ORD-5)
- [x] **Step 6**: Saga 超时处理 (ORD-4) — WebClient timeout 已有 3s，补偿逻辑已在 Saga 中实现
- [x] **Step 7**: 兑换频率限制 (ORD-6)
- [x] **Step 8**: 兑换通知 (ORD-8)

### Phase 5: Product Service 增强

- [x] **Step 9**: 产品批量导入 (PROD-5)
- [x] **Step 10**: 产品排序/推荐 (PROD-7)

---

## 文件变更清单

| 服务 | 新建文件 | 修改文件 |
|------|---------|---------|
| Gateway | RateLimitingConfig.java, CircuitBreakerConfig.java | pom.xml, application-local.yml |
| Auth | - | AuthDomainService.java, AuthDomainServiceImpl.java, AuthController.java, JwtService.java, JwtServiceImpl.java |
| Points | - | PointAccountMapper.xml, PointAccountRepositoryImpl.java, PointAccountDomainServiceImpl.java |
| Order | IdempotencyService.java, SagaTimeoutRecoveryScheduler.java, ExchangeRateLimitService.java, ExchangeNotificationService.java, V3__add_saga_fields.sql | ExchangeRemoteClient.java, ExchangeRecordApplicationServiceImpl.java, ExchangeRequest.java, pom.xml |
| Product | ProductBatchController.java | ListProductRequest.java, ProductMapper.xml, ProductDomainService.java, ProductDomainServiceImpl.java, ProductController.java |

---

## 预估工作量

- Phase 1 (GW-1): ~2 文件新建 + 2 文件修改
- Phase 2 (AUTH-3, AUTH-6): ~4 文件修改
- Phase 3 (PTS-6): ~3 文件修改
- Phase 4 (ORD-4/5/6/8): ~5 文件新建 + 3 文件修改
- Phase 5 (PROD-5/7): ~1 文件新建 + 4 文件修改
- **测试**: 每个 Step 配套单元测试

**总计**: ~8 新建 + ~16 修改 + ~10 测试类
