# AWSomeShop · 四服务全功能清单 + 实现进度

> 目标：四个后端服务全功能实现，前后端（Web + Android）完全匹配，按 phase 推进，每 phase codex 验证。
> 实现策略：以 intermediate 分支（workshop 官方参考答案、前后端一致）为权威规格移植到 baseline + Java21 编译验证 + codex 审查；intermediate 未覆盖的 Android 员工流程端点由我补齐。
> 验证基线：`export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home`

---

## 总进度

| Phase | 服务 | 后端编译 | 前端构建 | codex | 状态 |
|---|---|---|---|---|---|
| 1 | Auth | ✅ BUILD SUCCESS | ✅ vite built | ✅ | **完成** |
| 2 | Points | ✅ BUILD SUCCESS | ✅(随1) | — | **完成(Web 面)** |
| 3 | Product | ✅ BUILD SUCCESS | ✅(随1) | ✅ | **完成 + 补 get 端点** |
| 4 | Order | ✅ BUILD SUCCESS | ✅(随1) | — | **完成(Web 面)** |
| 5 | Android 契约 | ⚠️ 无SDK | — | ✅(修2bug) | **契约对齐完成** |
| 6 | 员工端后端补全 | — | — | — | **待做(见下)** |

---

## 各服务全功能清单

### 🔑 Auth Service
**已完成（移植 intermediate，编译通过）**
- [x] UserEntity（用户名/密码/角色/状态）
- [x] 登录 `POST /api/v1/public/auth/login`（JWT 签发）
- [x] 登出 `POST /api/v1/public/auth/logout`
- [x] 用户列表分页 `POST /api/v1/public/auth/user/list`
- [x] JwtService（签发/解析/校验）
- [x] TokenCacheService（Redis）
- [x] V2 建用户表
- [x] Web 登录接真实 API（删除 MOCK_USERS）

**待补（员工/网关完整链路）**
- [ ] `/internal/auth/validate`（网关鉴权依赖；intermediate 未含）
- [ ] 注册端点 + 注册时调 points 初始化积分
- [ ] logout 黑名单接入校验链路（codex 指出的 gap）

### ⭐ Points Service
**已完成**
- [x] PointRuleEntity + 积分规则分页 `POST /api/v1/admin/point-rule/list`
- [x] V2 建积分规则表
- [x] Web PointRules 管理页接 API

**待补（员工端 + 跨服务，net-new）**
- [ ] 积分账户领域（PointAccountEntity：余额/累计获得/累计使用）
- [ ] 积分流水领域（PointTransactionEntity）
- [ ] `POST /api/v1/public/point/balance`（Android 积分中心）
- [ ] `POST /api/v1/public/point/transaction/list`（Android 流水）
- [ ] 内部接口：初始化积分（被 auth 调）、扣减积分（被 order 调）、手动调整（admin）
- [ ] 建账户表 + 流水表

### 📦 Product Service
**已完成**
- [x] ProductEntity + CategoryEntity（二级分类）
- [x] 商品创建 `POST /api/v1/public/product/create`
- [x] 商品列表 `POST /api/v1/public/product/list`
- [x] 类目树 `POST /api/v1/public/category/list`
- [x] 库存悲观锁、V2/V3 建表
- [x] Web Products/CreateProduct/Categories 接 API
- [x] **商品详情 `POST /api/v1/public/product/get`（我新增，编译通过）** ← Android 详情页

**待补**
- [ ] 内部接口：扣减库存（被 order 调，悲观锁已具备基础）
- [ ] 商品图片真实上传（现为 URL 字段）

### 🧾 Order Service
**已完成**
- [x] ExchangeRecordEntity + 统计实体
- [x] 兑换记录分页 `POST /api/v1/admin/exchange-record/list`
- [x] 兑换详情 `POST /api/v1/admin/exchange-record/get`
- [x] 兑换统计 `POST /api/v1/admin/exchange-record/stats`
- [x] V2 建兑换记录表
- [x] Web ExchangeRecords 管理页接 API

**待补（员工兑换核心 + Saga，net-new，最难）**
- [ ] 员工兑换下单 `POST /api/v1/public/order/exchange`
- [ ] 员工订单列表 `POST /api/v1/public/order/list`
- [ ] 员工订单详情 `POST /api/v1/public/order/get`
- [ ] 跨服务编排：调 product 扣库存 + 调 points 扣积分
- [ ] **Saga 补偿**：任一步失败回滚库存与积分
- [ ] 跨服务客户端（FeignClient/WebClient）+ 容错

---

## 前端匹配状态

### Web（awsome-shop-frontend）—— ✅ 完全匹配
- services/api/{auth,product,category,pointRule,exchangeRecord}.ts 全部移植
- types/api.ts、request.ts（Result 信封解包 + JWT 注入）就绪
- 登录 + 4 个管理页接真实 API；`npm run build` 通过

### Android（awsome-shop-android）—— ✅ 契约对齐（待后端补员工端点）
- ApiService.kt 全部改为 POST + 网关前缀 + Result<T> 信封
- PageResultDto / ListProductRequest 字段对齐后端（codex 修正）
- ShopRepository DTO→领域模型映射，11 页面签名不变
- ⚠️ 本机无 Android SDK，无法 gradle 编译（仅语法/契约校验）
- ⚠️ 依赖的员工端点（point/balance、order/exchange 等）属 Phase 6 后端补全

---

## 下一步（Phase 6）建议顺序
1. Points 员工端（账户/流水/余额）—— order 依赖它扣积分
2. Product 内部扣库存端点
3. Auth 注册 + validate + 注册初始化积分
4. Order 员工兑换 + 跨服务编排 + Saga（最后，最难）
5. 端到端联调：登录→浏览→兑换→扣库存+扣积分→订单（Web + Android 同契约）
