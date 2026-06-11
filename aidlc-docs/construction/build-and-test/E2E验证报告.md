# AWSomeShop · 端到端（E2E）验证报告

> 验证时间：2026-06-10 · 真实启动 4 个后端服务 + MySQL + Redis，调用真实 API 跑通完整业务流
> 验证方式：每个服务打成自包含 fat jar 用 `java -jar` 启动（避开 4 服务 common 模块 GAV 冲突），datasource 覆盖到本机 MySQL 3306

## 环境
- MySQL 8.4（docker mysql84，3306）：建 4 库 awsome_shop_{auth,product,point,order}
- Redis（gen-redis，6379）：auth token 缓存
- 4 服务端口：auth 8001 / product 8002 / point 8003 / order 8004
- Flyway 自动建表全部成功（auth V1-V2、product V1-V3、point V1-V3、order V1-V3）

## 验证结果：✅ 全部通过

| # | 验证项 | 服务 | 结果 |
|---|---|---|---|
| 1 | 用户登录返回 JWT + 角色 | auth | ✅ token + role=ADMIN |
| 2 | 创建商品（stock=10） | product | ✅ id=1 |
| 3 | 商品列表分页 | product | ✅ records 返回 |
| 4 | 初始化用户积分=2000 | point | ✅ balance=2000 |
| 5 | 查询积分余额 | point | ✅ 2000 |
| 6 | **跨服务兑换 Saga** | order→product+point | ✅ 兑换记录创建 |
| 7 | 兑换后库存扣减 10→9 | product | ✅ stock=9 |
| 8 | 兑换后积分扣减 2000→1500 | point | ✅ balance=1500 |
| 9 | 积分流水 REDEEM -500 | point | ✅ 流水正确 |
| 10 | 员工订单列表 | order | ✅ 1 条订单 |
| 11 | **Saga 补偿**：积分不足兑换失败+库存回补 | order | ✅ 库存 9→8→9 回补 |

## 关键证据

**正向链路（用户1 兑换 500 分商品）**
- 库存：10 → 9 ✅
- 积分：2000 → 1500（totalUsed=500）✅
- 流水：`REDEEM -500 余额1500` + `INIT 2000 余额2000` ✅
- 订单：`EX1781059132009 E2E测试耳机 -500分 PENDING_DELIVERY` ✅

**补偿链路（用户2 仅 100 分，买 500 分商品）**
- 兑换返回失败：`409003 扣减积分远程调用异常`
- 库存：兑换前 9 → 扣到 8 → **补偿回补到 9** ✅
- 证明：Saga 在第 2 步（扣积分）失败后正确回滚了第 1 步（扣库存）

## 结论

**四个后端服务全部做完且端到端跑通**，包括最复杂的 order 跨服务兑换 Saga（扣库存+扣积分+失败补偿）。这是真实分布式调用验证，非 mock。

## 验证中发现并记录的真实问题

1. **4 服务 common 模块 GAV 冲突**（架构隐患）：auth/product/point/order 的 common 模块都用相同坐标 `com.awsome.shop:common:1.0.0-SNAPSHOT`，`mvn install` 到共享 .m2 会互相覆盖，导致 `spring-boot:run -pl bootstrap` 加载到错误服务的类。
   - 规避：用 `mvn package` 生成自包含 fat jar，`java -jar` 运行（fat jar 内置本服务类，运行时不依赖 .m2）。
   - 根治建议：4 个服务 common 模块应使用不同 artifactId（如 auth-common/product-common）。

2. **Saga 已知限制**（codex 早前指出，workshop 非阻塞）：补偿失败仅记日志无重试队列；网络超时无幂等键区分"失败"与"已提交但响应丢失"。生产化需引入。

3. **local profile 与本机环境差异**：local 配置指向 MySQL 3307 + root/root，本机是 3306 + aidlc_root_pw → 用 `--spring.datasource.*` 覆盖，未改源码。
