# Android 前端缺口修复 — 代码生成计划

> **计划版本**: v1.0  
> **目标**: 对齐最新 API 规范(v1.2)，修复 Android 端所有阻塞性问题  
> **API 基准**: `api-docs/API接口文档.md` (2026-06-11, v1.2)  
> **现状**: 11 页面 UI 已完成，但 API 路径/方法不匹配后端

---

## 🔴 P0 — 阻塞核心流程（必须修复）

### Step 1: 重写 ApiService.kt — 对齐 RESTful API 路径

**问题**: 当前所有接口使用 `POST` + 旧路径 `auth/api/v1/public/auth/login`  
**目标**: 对齐最新规范，使用正确的 HTTP 方法和路径

**变更映射**:

| 当前（错误） | 目标（正确） | 方法 |
|------------|-----------|------|
| `POST auth/api/v1/public/auth/login` | `POST auth/api/auth/login` | POST |
| `POST auth/api/v1/public/auth/logout` | `POST auth/api/auth/logout` | POST |
| `POST product/api/v1/public/product/list` | `GET product/api/products` | GET |
| `POST product/api/v1/public/product/get` | `GET product/api/products/{id}` | GET |
| `POST product/api/v1/public/category/list` | `GET product/api/categories/tree` | GET |
| `POST point/api/v1/public/point/balance` | `GET point/api/points/balance?userId=` | GET |
| `POST point/api/v1/public/point/transaction/list` | `GET point/api/points/transactions?userId=&page=&size=` | GET |
| `POST order/api/v1/public/order/exchange` | `POST order/api/orders` | POST |
| `POST order/api/v1/public/order/list` | `GET order/api/orders?userId=&page=&size=&status=&keyword=` | GET |
| `POST order/api/v1/public/order/get` | `GET order/api/orders/{id}` | GET |

**新增接口**:
| 接口 | 方法 | 用途 |
|------|------|------|
| `POST auth/api/auth/register` | POST | 用户注册 |
| `GET auth/api/users/me` | GET | 获取当前用户信息 |
| `POST order/api/orders/{id}/confirm-receipt?userId=` | POST | 确认收货 |

**执行项**:
- [x] 重写 `ApiService.kt` 接口方法（POST→GET，路径修正）
- [x] GET 请求参数改为 `@Query` 注解，路径参数用 `@Path`
- [x] 更新 DTO（新增 `images`、`department`、`keyword` 等字段）
- [x] 验证 Retrofit baseUrl 配置对齐网关前缀格式

---

### Step 2: 添加 OkHttp Token 拦截器

**问题**: Token 存在 DataStore 但不注入到请求 Header  
**目标**: 所有非 PUBLIC 请求自动携带 `Authorization: Bearer {token}`

**执行项**:
- [x] 在 `di/` 创建 `AuthInterceptor.kt`：从 DataStore 读取 token，注入 Header
- [x] 在 Hilt Module 中为 OkHttpClient 添加拦截器
- [x] PUBLIC 路径（login/register/products GET/categories/files）跳过注入
- [x] 处理 401 响应：清除 token + 导航到登录页

---

### Step 3: 添加注册页面 (RegisterScreen)

**问题**: 仅有登录，无注册入口  
**目标**: 实现注册页面，对接 `POST /api/auth/register`

**执行项**:
- [x] 创建 `ui/screens/register/RegisterScreen.kt`（用户名/密码/昵称/工号表单）
- [x] 创建 `ui/screens/register/RegisterViewModel.kt`
- [x] 在 `AuthRepository` 添加 `register()` 方法
- [x] 在 `Routes.kt` 添加 `Register` 路由
- [x] 在 `AppNavGraph.kt` 注册导航
- [x] 在 `LoginScreen` 添加"注册"链接跳转

---

### Step 4: 更新 ShopRepository 适配新 API 签名

**问题**: Repository 层使用旧的 `@Body` 请求方式，需改为 GET Query 参数  
**目标**: 所有 Repository 方法对齐新 ApiService 签名

**执行项**:
- [x] `getProducts()` 改为传 query 参数（page/size/name/category）
- [x] `getProductDetail()` 改为传 path 参数
- [x] `getPointsBalance()` 改为传 query 参数
- [x] `getPointsTransactions()` 改为传 query 参数
- [x] `getOrders()` 改为传 query 参数（新增 keyword 搜索）
- [x] `getOrderDetail()` 改为传 path 参数
- [x] 新增 `confirmReceipt(orderId)` 方法

---

## 🟠 P1 — 影响用户体验

### Step 5: 会话恢复完善

**问题**: App 进程被杀后 `currentUserId` 丢失  
**目标**: 所有 ViewModel init 时自动恢复会话

**执行项**:
- [x] 在 `ShopRepository` 的关键方法开头添加 `ensureUserId()` 检查
- [x] 或者在 Hilt Module 提供 userId 的 Flow/LiveData，ViewModel 自动订阅

---

### Step 6: 错误处理增强

**问题**: 网络失败仅显示错误文本，无重试  
**目标**: 统一错误处理 + 重试机制

**执行项**:
- [x] 创建 `ui/components/ErrorRetryView.kt` 可复用组件
- [x] 处理 401 → 自动跳转登录
- [x] 处理 409 → 显示业务错误（积分不足/库存不足）
- [x] 处理网络超时 → 显示重试按钮

---

### Step 7: 确认收货功能

**问题**: 订单详情页无"确认收货"按钮  
**目标**: DELIVERING 状态的订单显示确认收货按钮

**执行项**:
- [x] `OrderDetailScreen` 添加"确认收货"按钮（仅 DELIVERING 状态可见）
- [x] 调用 `POST /api/orders/{id}/confirm-receipt?userId=`
- [x] 成功后刷新订单状态为 COMPLETED

---

## 🟡 P2 — 体验优化

### Step 8: 订单搜索功能

**问题**: 订单列表无搜索  
**目标**: 支持按订单号/商品名搜索

**执行项**:
- [x] `OrdersScreen` 添加搜索框
- [x] `OrdersViewModel` 传入 keyword 参数
- [x] 调用 `GET /api/orders?keyword=xxx`

---

### Step 9: Logout 确认对话框

**执行项**:
- [x] `ProfileScreen` 退出按钮弹出确认 Dialog
- [x] 确认后执行 `POST /api/auth/logout` + 清除本地会话

---

### Step 10: DTO 字段更新（对齐 v1.2 新增字段）

**执行项**:
- [x] `ProductDto` 添加 `images: List<String>` 字段（多图）
- [x] `ExchangeRecordDto` 添加 `freightPoints`/`balanceAfter`/`carrier`/`timeline` 字段
- [x] `PointTransactionDto` 添加 `operator` 字段
- [x] 更新领域模型映射（toDomain）

---

## 文件变更清单

| 操作 | 文件 |
|------|------|
| **重写** | `data/remote/ApiService.kt` |
| **新建** | `di/AuthInterceptor.kt` |
| **新建** | `ui/screens/register/RegisterScreen.kt` |
| **新建** | `ui/screens/register/RegisterViewModel.kt` |
| **新建** | `ui/components/ErrorRetryView.kt` |
| **修改** | `data/repository/ShopRepository.kt` |
| **修改** | `data/repository/AuthRepository.kt` |
| **修改** | `ui/navigation/Routes.kt` |
| **修改** | `ui/navigation/AppNavGraph.kt` |
| **修改** | `ui/screens/login/LoginScreen.kt`（添加注册链接） |
| **修改** | `ui/screens/order/OrderDetailScreen.kt`（确认收货按钮） |
| **修改** | `ui/screens/order/OrdersScreen.kt`（搜索框） |
| **修改** | `ui/screens/profile/ProfileScreen.kt`（退出确认） |
| **修改** | `di/NetworkModule.kt`（添加拦截器） |

---

## 优先级与工作量估算

| Step | 功能 | 优先级 | 估算 |
|------|------|--------|------|
| 1 | API 路径对齐 | 🔴 P0 | 1h |
| 2 | Token 拦截器 | 🔴 P0 | 30min |
| 3 | 注册页面 | 🔴 P0 | 1h |
| 4 | Repository 适配 | 🔴 P0 | 45min |
| 5 | 会话恢复 | 🟠 P1 | 30min |
| 6 | 错误处理 | 🟠 P1 | 45min |
| 7 | 确认收货 | 🟠 P1 | 30min |
| 8 | 订单搜索 | 🟡 P2 | 20min |
| 9 | Logout 确认 | 🟡 P2 | 15min |
| 10 | DTO 字段更新 | 🟡 P2 | 30min |

**总计**: ~6 小时
