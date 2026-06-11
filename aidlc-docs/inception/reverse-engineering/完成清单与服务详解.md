# AWSomeShop · 完成清单 + 服务详解 + 前端策略

> 基于对 baseline / intermediate 两个分支的实际代码勘察（2026-06-10）
> 工作目录：`/Users/xrre/Documents/Workshop/aidlc`

---

## 〇、一句话结论（先看这个）

1. **前端已经存在，而且做得很漂亮** —— Web（React 19 + MUI 6）和 Android（Jetpack Compose）都有，UI 是成品级现代风格，**和设计稿 `awsome-shop.pen` 一致**。
2. **不要用 `/design-html` 重新设计页面** —— 那会破坏已有的、与设计稿一致的精美 UI。你要做的是**保持界面、把数据接上真实后端**。
3. **baseline = 漂亮的 UI 外壳 + 静态假数据 + 空的后端骨架**；**intermediate = 接上真实 API 的完整实现（参考答案）**。
4. **本次 workshop 的核心任务**：用 AI-DLC 流程，把"假数据"换成"真业务"——后端填业务逻辑，前端接 API，两端界面保持一致。

---

## 一、整体完成度总览

| 模块 | 技术栈 | baseline 状态 | intermediate 状态 | 你要做的 |
|---|---|---|---|---|
| **auth-service** | Java21/SpringBoot3/DDD | 空骨架（仅接口/目录） | +956 行完整实现 | 注册/登录/JWT/角色 |
| **product-service** | 同上 | 空骨架 | +1298 行 | 商品/分类 CRUD/库存 |
| **points-service** | 同上 | 空骨架 | +401 行 | 积分余额/发放/流水 |
| **order-service** | 同上 | 空骨架 | +596 行 | 兑换/Saga 跨服务编排 |
| **gateway-service** | SpringCloudGateway | ✅ 已完成（只有 baseline 分支） | — | 基本无需改 |
| **frontend（Web）** | React19/MUI6/Vite | ✅ UI 完成 + 假数据 | +3183 行（接 API/新增管理页） | 接真实 API + 补管理页 |
| **android** | Kotlin/Compose | ✅ UI 完成（只有 main 分支） | — | 接真实 API |

> **关键发现**：前端 baseline 已经有精美 UI，只是用静态 mock 数据（如 ShopHome 里写死的 `PRODUCTS` 数组）。这正是 workshop 的设计——让你聚焦"业务接入"而非"画界面"。

---

## 二、前端界面清单（已存在，无需重新设计）

### 2.1 Web 前端（`awsome-shop-frontend`）

**技术栈**：React 19 · TypeScript · Vite 7 · MUI 6 · Zustand · React Router 7 · i18next（中英双语）· Axios

**baseline 已有页面**（UI 完整，数据是 mock）：
| 页面 | 路径 | 端 | 说明 |
|---|---|---|---|
| Login | `/login` | 公共 | 登录页（已有真实 login store 调用骨架） |
| ShopHome | `/` | 员工端 | 商城首页：分类筛选 + 商品卡片 + 积分价 |
| Home | `/home` | 员工端 | 落地页 |
| Dashboard | `/admin` | 管理端 | 仪表盘：指标卡 + 数据表格 |
| NotFound | `*` | 公共 | 404 |

**intermediate 新增页面**（workshop 中你会补全）：
| 页面 | 端 | 说明 |
|---|---|---|
| Products / CreateProduct | 管理端 | 商品管理 + 新建商品（477 行表单） |
| Categories | 管理端 | 分类管理（492 行，二级分类） |
| PointRules | 管理端 | 积分规则配置（469 行） |
| ExchangeRecords | 管理端 | 兑换记录管理（632 行，发货状态） |

**布局组件（已就绪）**：`EmployeeLayout`（员工端顶栏）、`AdminLayout`（管理端侧边栏）、`AppHeader`、`Sidebar`、`AvatarMenu`（切换语言/主题/退出）

### 2.2 Android 前端（`awsome-shop-android`）

**技术栈**：Kotlin · Jetpack Compose · Hilt（DI）· Retrofit（`ApiService`）· MVVM（Repository 模式）

**已有页面（11 个 Compose Screen）**：
| 模块 | 页面 |
|---|---|
| login | LoginScreen |
| home | HomeScreen（商城首页） |
| product | ProductDetailScreen |
| points | PointsCenterScreen · PointsHistoryScreen |
| redemption | ConfirmRedemptionScreen · DeliveryInfoScreen · RedemptionSuccessScreen |
| order | OrdersScreen · OrderDetailScreen |
| profile | ProfileScreen |

**数据层（已有骨架）**：`ApiService`（Retrofit 接口）、`AuthRepository`、`ShopRepository`、模型 `User/Product/Order/PointsTransaction/Address`

### 2.3 两端界面一致性策略 ✅

你要求"Web/Android 前端界面保持一致"——**这一点设计稿已经替你保证了**：两端都源自同一份 `awsome-shop.pen`，页面结构天然对齐：

| 业务功能 | Web 页面 | Android 页面 | 一致性要点 |
|---|---|---|---|
| 登录 | Login | LoginScreen | 同样的用户名/密码 + 角色跳转 |
| 商城首页 | ShopHome | HomeScreen | 分类筛选 + 商品卡 + 积分价 |
| 商品详情 | （详情弹层） | ProductDetailScreen | 同字段 |
| 积分中心 | （在 Header/Profile） | PointsCenter/History | 余额 + 流水 |
| 兑换流程 | ShopHome→下单 | Confirm→Delivery→Success | 三步兑换 |
| 订单 | （员工订单） | Orders/OrderDetail | 状态机一致 |

**保持一致的做法**：两端都对接**同一套 Gateway API 契约**（`/api/v1/...`）。只要后端契约统一，两端数据、状态、字段就天然一致。无需重画 UI。

---

## 三、每个服务详细介绍

### 🛡️ Gateway Service（API 网关，:8080）—— 已完成
- **职责**：系统唯一入口。JWT 校验、路由转发、按角色 RBAC。
- **状态**：仅 baseline 分支即完整，**基本不用动**。
- **路由**：`/api/v1/auth|product|point|order/**` → 各后端；调用 auth 的 `/internal/auth/validate` 校验 token。

### 🔑 Auth Service（认证授权，:8001）—— 你要填 956 行
- **职责**：注册、登录、签发/校验 JWT、角色（员工/管理员）、账号启停。
- **intermediate 关键产物**：`UserEntity`、`AuthDomainServiceImpl`（81行）、`JwtServiceImpl`（89行）、`UserRepositoryImpl`、`TokenCacheServiceImpl`（Redis）、`AuthController`/`UserController`、`V2__create_user_table.sql`。
- **跨服务**：注册时调用 points 初始化积分余额。

### 📦 Product Service（商品目录，:8002）—— 你要填 1298 行（最大）
- **职责**：商品 CRUD、二级分类、图片上传、库存（悲观锁防超卖）。
- **intermediate 关键产物**：`ProductEntity`/`CategoryEntity`、`ProductDomainServiceImpl`、`ProductRepositoryImpl`（134行）、`ProductController`/`CategoryController`、`V2/V3` 建表 SQL。

### ⭐ Points Service（积分账户，:8003）—— 你要填 401 行（最小）
- **职责**：积分余额、自动发放、管理员手动调整、变动流水。
- **被依赖**：auth（注册初始化）、order（兑换扣减）都要调它——耦合度最高。

### 🧾 Order Service（兑换编排，:8004）—— 你要填 596 行（最难）
- **职责**：兑换下单、订单状态/发货、**跨服务编排者**。
- **intermediate 关键产物**：`ExchangeRecordEntity`、`ExchangeRecordDomainServiceImpl`、`ExchangeRecordController`、`V2` 建表 SQL。
- **难点**：兑换时调 product 扣库存 + 调 points 扣积分，失败走 **Saga 补偿回滚**。

---

## 四、本次应该做什么（推荐 + AI-DLC 流程）

### 4.1 推荐：以 **Auth Service** 为旗舰，走完整 AI-DLC 全栈链路

**为什么选 auth**：
- 是所有服务的依赖根基（没有登录，其它都演示不了）
- 复杂度适中，能在 workshop 时长内走完 AI-DLC 全流程而不翻车
- 端到端可演示：登录页（Web/Android）→ 网关校验 → auth 签发 JWT → 角色跳转
- 和你最初想做的"用户权限管理 demo"完全吻合

**进阶（时间充裕）**：再做 order 的 Saga 跨服务编排，作为"惊艳"加分项。

### 4.2 AI-DLC 具体怎么走（以 auth 为例）

```
INCEPTION（WHAT/WHY）
  1. Requirements Analysis  → 需求：注册/登录/JWT/角色/账号启停
  2. User Stories           → "员工登录查看积分"/"管理员管理账号"
  3. Application Design      → 复用既有 DDD 骨架，定义 UserEntity + 端口

CONSTRUCTION（HOW）—— per-unit 循环
  4. Functional Design       → 领域模型、业务规则、API 契约（对齐 Gateway 路由）
  5. NFR Requirements/Design  → bcrypt 密码、无状态 JWT、Redis token 缓存
  6. Code Generation          → 让 AI 在空骨架里填实现（参考 intermediate 验证方向）
  7. 前端接入                  → 前端 Login 页换掉 mock，接 /api/v1/auth/login
  8. Build & Test             → mvn test + 前端联调 + 浏览器端到端验证

两端一致性
  - Web Login + Android LoginScreen 对接同一 /api/v1/auth 契约
  - 字段/错误码/角色枚举统一 → 天然一致
```

### 4.3 前端任务（关键：保持界面，只接数据）
- **不重画 UI**。Web 把 ShopHome/Dashboard 里写死的 mock 数组换成 API 调用；补 intermediate 的 4 个管理页。
- Android 把 Repository 的假数据换成 Retrofit 真调用。
- 两端共用 Gateway 契约，确保一致。
- 可用 **MUI MCP** 辅助补全管理页组件；用 **Chrome DevTools MCP** 做端到端验证。

---

## 五、为什么不用 /design-html

`/design-html` 是"从零设计生产级页面"的工具。但本项目：
- ✅ 前端 UI **已存在且精美**（成品级 MUI 设计，源自 `awsome-shop.pen`）
- ✅ 设计风格**已统一**（Web/Android 同源设计稿）
- ❌ 重新设计会**破坏一致性**、浪费 workshop 时间、偏离 AI-DLC 主线

**如果你确实想用 `/design-html`**，合理场景只有一个：为 intermediate 中**尚未画的新页面**（如某个全新的"通知中心"扩展服务页）做设计。但核心 5 类页面都已就绪。
