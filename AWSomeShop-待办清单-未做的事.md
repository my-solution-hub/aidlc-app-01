# AWSomeShop · 还没做的事（基于 baseline 真实代码勘察）

> 勘察时间：2026-06-10 · 全部基于 baseline 分支实际文件，非推测
> 结论先行：**4 个后端服务的业务代码 = 0（全是 Test 桩占位）；前端 UI 完成但数据是假的；Gateway 已完整。**

---

## 〇、最重要的发现

**baseline 四个后端服务（auth/product/points/order）里，没有任何真实业务代码。**
每个服务只有一套同名的"Test 占位骨架"：
- `TestEntity.java`（不是 UserEntity/ProductEntity…）
- `TestController.java`
- `TestDomainServiceImpl.java`
- `TestRepositoryImpl.java`
- `V1__create_test_table.sql`（建的是 test 表，不是业务表）

也就是说：**DDD 的 26 模块目录结构搭好了，但每个"格子"里装的是 Test 样例，真正的业务实体、逻辑、表、接口全部要你从零填进去。**

---

## 一、后端：4 个服务 = 0 业务代码（按服务列缺失逻辑）

### 🔑 Auth Service —— 全部待做
| 层 | 现状 | 要补的业务逻辑 |
|---|---|---|
| 领域实体 | 只有 TestEntity | `UserEntity`（用户名/密码/角色/状态） |
| 领域服务 | 只有 TestDomainServiceImpl | 注册逻辑、登录校验、密码 bcrypt、角色判定 |
| 仓储 | 只有 TestRepositoryImpl | `UserRepository` + MyBatis Mapper/XML/PO |
| 缓存 | 无 | `TokenCacheService`（Redis 存 JWT） |
| 安全 | 无 | `JwtService`（签发/解析/校验 JWT） |
| 接口 | 只有 TestController | `AuthController`(注册/登录) + `UserController`(账号管理) |
| 数据库 | V1 是 test 表 | `V2__create_user_table.sql` |
| **跨服务** | 无 | 注册时调用 points 初始化积分余额 |

### 📦 Product Service —— 全部待做（工作量最大）
| 层 | 要补的业务逻辑 |
|---|---|
| 实体 | `ProductEntity`（商品）+ `CategoryEntity`（二级分类） |
| 领域服务 | 商品 CRUD、分类管理、**库存扣减（悲观锁防超卖）** |
| 仓储 | Product/Category Repository + Mapper/XML/PO |
| 接口 | `ProductController` + `CategoryController` |
| 数据库 | `V2__create_product_table.sql` + `V3__create_category_table.sql` |
| 文件 | 商品图片上传 |

### ⭐ Points Service —— 全部待做（工作量最小，但耦合最高）
| 层 | 要补的业务逻辑 |
|---|---|
| 实体 | 积分账户实体 + 流水实体 |
| 领域服务 | 余额查询、自动发放、管理员手动调整（增/减）、变动流水记录 |
| 仓储 | Points Repository + Mapper/XML/PO |
| 接口 | PointsController |
| 数据库 | 积分表 + 流水表建表 SQL |
| **被依赖** | 被 auth（注册初始化）和 order（兑换扣减）调用 |

### 🧾 Order Service —— 全部待做（难度最高）
| 层 | 要补的业务逻辑 |
|---|---|
| 实体 | `ExchangeRecordEntity`（兑换记录）+ 统计实体 |
| 领域服务 | 下单兑换、订单状态机、发货状态管理 |
| 仓储 | ExchangeRecord Repository + Mapper/XML/PO |
| 接口 | `ExchangeRecordController` |
| 数据库 | `V2__create_exchange_record_table.sql` |
| **跨服务编排** | 兑换 = 调 product 扣库存 + 调 points 扣积分；**任一失败走 Saga 补偿回滚** |

---

## 二、前端：UI 完成，但"数据全是假的"

### Web 前端 —— 要做"接真实 API"
| 项 | 现状 | 待做 |
|---|---|---|
| 登录 | `useAuthStore` 明确写 `// TODO: replace with real API call`，用 `MOCK_USERS` 假登录 | 换成真实 `/api/v1/auth/login` |
| 商城首页 | ShopHome 写死 `PRODUCTS`/`CATEGORIES` 两个静态数组 | 换成 `/api/v1/product` 真实数据 |
| 请求层 | ✅ request.ts 拦截器/token 已就绪（这块不用做） | — |
| 管理页 | baseline **没有**：商品管理/分类/积分规则/兑换记录 | 新建这 4 个管理页（intermediate 有 ~2000 行参考） |
| 服务封装 | baseline **没有** `services/api/` 目录 | 新建 auth/product/category/pointRule/exchangeRecord 的 API 封装 |
| 类型定义 | baseline **没有** `types/api.ts` | 新建 API 类型定义（~159 行） |

### Android 前端 —— 要做"接真实 API"
| 项 | 现状 | 待做 |
|---|---|---|
| 11 个 Compose 页面 | ✅ UI 已完成 | 不用重画 |
| 数据层 | `ApiService`(Retrofit)/`Repository` 骨架在 | 把 Repository 假数据换成真实网络调用 |
| 模型 | User/Product/Order/PointsTransaction/Address 已有 | 对齐后端真实字段 |

---

## 三、Gateway —— ✅ 基本不用做

已完整实现：路由常量、`AuthenticationGatewayFilter`（鉴权过滤器）、`OperatorIdInjectionFilter`、`AccessLogFilter`、`AuthServiceClient`（调 auth 校验）、AES 加密、TokenInfo 领域模型。**只有 baseline 分支，说明它本就是"给定基础设施"，无需改动。**

> ⚠️ 唯一隐含依赖：Gateway 的 `AuthServiceClient` 会调用 auth 的 `/api/v1/internal/auth/validate`。所以**你必须先把 auth 的这个内部校验端点做出来**，否则网关鉴权链路跑不通。

---

## 四、未做事项 —— 按依赖顺序的执行清单

```
[ ] 0. 基础设施确认（MySQL 容器已跑，4 个 schema）        ← 准备清单已 ✅
[ ] 1. Auth Service 全部业务          ← 必须最先，gateway 依赖它的 validate 端点
        [ ] UserEntity + 角色/状态
        [ ] 注册/登录/bcrypt/JWT 签发校验
        [ ] Redis token 缓存
        [ ] /internal/auth/validate（网关依赖！）
        [ ] V2 建用户表
        [ ] 注册时调 points 初始化（依赖步骤 3）
[ ] 2. 前端登录联调       ← 去掉 MOCK_USERS，接 /api/v1/auth/login（Web + Android）
[ ] 3. Points Service 全部业务   ← 被 auth/order 依赖，排在 order 前
[ ] 4. Product Service 全部业务  ← 商品/分类/库存悲观锁
[ ] 5. 前端商城/管理页联调   ← ShopHome 接商品 API；补 4 个管理页
[ ] 6. Order Service 全部业务   ← 最难：跨服务编排 + Saga 补偿
[ ] 7. 兑换全链路端到端验证   ← 登录→浏览→兑换→扣库存+扣积分→订单
[ ] 8. 两端一致性核对   ← Web/Android 对齐同一 Gateway 契约
```

**建议开发顺序**：`Auth → Points → Product → Order`（按依赖拓扑），前端随各后端就绪逐步联调。

---

## 五、风险/坑（实测发现）

1. **gateway 强依赖 auth 的 validate 端点** —— auth 没做完，整个鉴权链路是断的，别的服务无法演示。auth 必须第一个做。
2. **前端登录写死 MOCK_USERS** —— 不删掉它，永远连不上真后端。
3. **order 的 Saga 是真难点** —— 跨两个服务的分布式事务，失败补偿要想清楚，建议放最后且预留充足时间。
4. **points 耦合最高** —— 被 auth 和 order 两头调，接口契约要先定稳，否则两边返工。
5. **JDK 版本坑**（准备清单已记）—— 必须用 Java 21 编译，本机默认 25 会因 Lombok 报 `TypeTag::UNKNOWN`。
