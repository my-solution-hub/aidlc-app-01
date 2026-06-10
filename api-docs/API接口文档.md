# AWSomeShop 后端 API 接口文档（REST / 完整版）

> 风格：RESTful · 统一经 API 网关访问（默认 `http://localhost:8088`）
> 字段标注 `*` 表示必填。`?` 查询参数；`{}` 路径参数。

## 📎 标准 OpenAPI 规范（机器可读，权威来源）

本文档的端点与字段均以下列 OpenAPI 3 规范为准：

| 文件 | 说明 |
|---|---|
| **`awsomeshop-openapi.yaml`** | **合并版（推荐）**：含网关前缀 `/auth /product /point /order`，4 服务全部端点，可直接导入 Postman/Apifox/ReDoc |
| `awsomeshop-openapi.json` | 同上，JSON 格式 |
| `{auth,product,point,order}-openapi.json` | 各服务单独的 OpenAPI（路径不含网关前缀，为服务本地视图）|
| `http://localhost:8088/swagger-ui.html` | 在线交互式（右上角下拉切换 4 服务，可试调）|

## 网关路径前缀（重要）

经网关访问时，每个服务的接口都带**服务前缀**，网关 `StripPrefix` 后转发：

| 服务 | 网关前缀 | 示例（网关地址 → 服务实际地址）|
|---|---|---|
| auth | `/auth` | `POST /auth/api/auth/login` → auth `/api/auth/login` |
| product | `/product` | `GET /product/api/products` → product `/api/products` |
| point | `/point` | `GET /point/api/points/balance` → point `/api/points/balance` |
| order | `/order` | `POST /order/api/orders` → order `/api/orders` |

> 下文各端点路径以**服务内路径**（不含前缀）书写，便于阅读；经网关调用时请在前面加对应服务前缀（如 `/product` + `/api/products` = `/product/api/products`）。`awsomeshop-openapi.yaml` 中已是带前缀的完整路径。

## 通用约定

### 统一响应信封 `Result<T>`
```json
{ "code": "SUCCESS", "message": "操作成功", "data": <T> }
```
`code == "SUCCESS"` 为成功，`data` 为业务数据；否则为业务错误，前端按 `code/message` 处理。

### 分页 `PageResult<T>`
```json
{ "current": 1, "size": 20, "total": 135, "pages": 7, "records": [ <T> ] }
```

### 认证分层（网关强制）
| 层级 | 路径 | 要求 |
|---|---|---|
| PUBLIC | `POST /api/auth/*`、`GET /api/products[/{id}]`、`GET /api/categories/tree`、`GET /api/files/{filename}` | 无需登录 |
| AUTHENTICATED | `GET /api/users/me`、`/api/orders/**`、`/api/points/**`、`POST /api/files/upload` | `Authorization: Bearer <JWT>` |
| ADMIN | `/api/admin/**` | JWT + 角色 `ADMIN`（否则 403）|
| INTERNAL | `/api/internal/**` | 仅服务间调用，不经网关对外暴露 |

### 错误码（前缀决定 HTTP 状态）
| 前缀 | HTTP | 含义 |
|---|---|---|
| `SUCCESS` | 200 | 成功 |
| `PARAM_*` | 400 | 参数校验失败（含 `POINT_CONFIG_INVALID` 发放配置非法）|
| `AUTH_*` | 401 | 未认证 / token 无效 |
| `AUTHZ_*` | 403 | 无权限（非 ADMIN 访问 admin 接口）|
| `NOT_FOUND_*` | 404 | 资源不存在 |
| `CONFLICT_*` | 409 | 冲突（库存不足、积分不足 `INSUFFICIENT_BALANCE`、唯一约束）|
| `SYS_*` | 500 | 系统错误 |

---

# 1. Auth Service（认证 / 用户）

## 1.1 认证

### POST /api/auth/login — 用户登录
- 请求体 **LoginRequest**：`username*`(string), `password*`(string)
- 响应 **LoginResponse**：`token`(string), `userId`(long), `username`(string), `nickname`(string), `role`(string)

### POST /api/auth/register — 用户注册（注册后自动初始化积分账户，best-effort）
- 请求体 **RegisterRequest**：`username*`(string), `password*`(string), `nickname`(string), `employeeId`(string 工号), `role`(string，默认 EMPLOYEE)
- 响应 **UserDTO**

### POST /api/auth/logout — 用户登出
- 请求头：`Authorization: Bearer <token>`
- 响应：`Void`

### GET /api/users/me — 当前登录用户
- 请求头：`Authorization`（或网关注入的 `X-Operator-Id`）
- 响应 **UserDTO**

## 1.2 用户管理（ADMIN）

### GET /api/admin/users — 用户列表分页
- 查询参数 **ListUserRequest**：`page`(int=1), `size`(int=20), `username`(string), `role`(string), `status`(string)
- 响应 `PageResult<UserDTO>`

### POST /api/admin/users — 创建用户
- 请求体 **CreateUserRequest**：`username*`, `password*`, `nickname`, `role`(默认 EMPLOYEE)
- 响应 **UserDTO**

### GET /api/admin/users/{id} — 用户详情
- 路径：`id*`(long) → 响应 **UserDTO**

### PUT /api/admin/users/{id} — 更新用户
- 路径：`id*`(long)；请求体 **UpdateUserRequest**：`nickname`, `role`, `employeeId`
- 响应 **UserDTO**

### PATCH /api/admin/users/{id}/status — 启用/禁用
- 路径：`id*`(long)；请求体 **UpdateUserStatusRequest**：`status*`(string：ACTIVE/DISABLED)
- 响应 **UserDTO**

## 1.3 内部
### POST /api/internal/auth/validate — 校验 Token（网关调用）
- 请求体 **ValidateRequest**：`token`(string)
- 响应（裸 JSON，非 Result 信封）**ValidateResponse**：`success`(bool), `operatorId`(string), `role`(string), `message`(string)

**UserDTO**: `id`(long), `username`, `nickname`, `employeeId`, `role`, `status`, `lastLoginAt`, `createdAt`, `updatedAt`

---

# 2. Product Service（商品 / 分类 / 文件）

## 2.1 商品

### GET /api/products — 商品列表（分页/过滤，PUBLIC）
- 查询参数 **ListProductRequest**：`page`(int), `size`(int), `name`(string), `category`(string)
- 响应 `PageResult<ProductDTO>`

### GET /api/products/{id} — 商品详情（PUBLIC）
- 路径：`id*`(long) → 响应 **ProductDTO**

### POST /api/admin/products — 创建商品（ADMIN）
- 请求体 **CreateProductRequest**：`name*`, `sku*`, `category*`, `brand`, `pointsPrice*`(int), `marketPrice`(number), `stock`(int), `status`(int 0下架/1上架), `description`, `imageUrl`, `subtitle`, `deliveryMethod`, `serviceGuarantee`, `promotion`, `colors`, `specs`(array)
- 响应 **ProductDTO**

### PUT /api/admin/products/{id} — 更新商品（ADMIN）
- 路径 `id*`；请求体 **UpdateProductRequest**（同 Create 字段 + `id*`）→ 响应 **ProductDTO**

### DELETE /api/admin/products/{id} — 删除商品（ADMIN）
- 路径 `id*` → 响应 `Void`

### PATCH /api/admin/products/{id}/status — 上/下架（ADMIN）
- 路径 `id*`；请求体 **UpdateProductStatusRequest**：`status*`(int) → 响应 **ProductDTO**

## 2.2 分类（≤2 级）

### GET /api/categories/tree — 分类树（PUBLIC）
- 查询参数 **ListCategoryRequest**：`name`(string), `status`(int)
- 响应 `List<CategoryDTO>`（含 `children` 二级）

### POST /api/admin/categories — 创建（ADMIN）
- 请求体 **CreateCategoryRequest**：`name*`, `parentId`(long，空=一级；指向二级则报错), `icon`, `sortOrder`(int), `status`(int), `description` → **CategoryDTO**

### PUT /api/admin/categories/{id} — 更新（ADMIN）
- 路径 `id*`；请求体 **UpdateCategoryRequest**：`name*`, `parentId`, `icon`, `sortOrder`, `status`, `description` → **CategoryDTO**

### DELETE /api/admin/categories/{id} — 删除（ADMIN）→ `Void`
### PATCH /api/admin/categories/{id}/status — 启停（ADMIN）
- 请求体 **UpdateCategoryStatusRequest**：`status*`(int) → **CategoryDTO**

## 2.3 文件

### POST /api/files/upload — 上传图片（登录）
- `multipart/form-data`，字段 `file`（jpg/png/gif/webp，≤5MB）
- 响应 **FileUploadResponse**：`filename`(string), `url`(string)
- 错误：`PARAM_FILE_001`(空) / `_002`(超5MB) / `_003`(类型不允许)

### GET /api/files/{filename} — 读取图片（PUBLIC）

## 2.4 内部
### POST /api/internal/products/deduct-stock — 扣库存（悲观锁，兑换调用）
### POST /api/internal/products/restore-stock — 回补库存（Saga 补偿）
- 请求体 **StockRequest**：`productId*`(long), `quantity*`(int) → **ProductDTO**

**ProductDTO**: `id`, `name`, `sku`, `category`, `brand`, `pointsPrice`, `marketPrice`, `stock`, `soldCount`, `status`, `description`, `imageUrl`, `subtitle`, `deliveryMethod`, `serviceGuarantee`, `promotion`, `colors`, `specs`, `createdAt`, `updatedAt`
**CategoryDTO**: `id`, `name`, `parentId`, `icon`, `sortOrder`, `status`, `description`, `productCount`, `children`(CategoryDTO[])

---

# 3. Point Service（积分账户 / 规则 / 发放）

## 3.1 员工积分

### GET /api/points/balance — 积分余额（登录）
- 查询：`userId*`(long) → 响应 **PointAccountDTO**：`userId`, `balance`, `totalEarned`, `totalUsed`

### GET /api/points/transactions — 积分流水分页（登录）
- 查询 **ListTransactionRequest**：`userId*`(long), `page`(int), `size`(int), `type`(string)
- 响应 `PageResult<PointTransactionDTO>`

## 3.2 员工积分管理（ADMIN）

### GET /api/admin/points/users — 全体员工积分余额分页
- 查询 **ListUserPointRequest**：`page`(int), `size`(int), `keyword`(string，按 userId)
- 响应 `PageResult<UserPointDTO>`

### POST /api/admin/points/adjust — 手动调整积分
- 请求体 **AdminAdjustPointRequest**：`userId*`(long), `amount*`(int，正增负减), `reason*`(string 1-200)
- 响应 **PointBalanceDTO**；扣减后为负 → `INSUFFICIENT_BALANCE`(409) 不写入；成功写一笔 `ADJUST` 流水

**UserPointDTO**: `userId`, `username`, `nickname`, `employeeNo`, `balance`, `totalEarned`, `totalUsed`, `updatedAt`（username/nickname/employeeNo 由 point 调 auth 充填，auth 不可达降级为 null）

## 3.3 积分规则（ADMIN）

### GET /api/admin/point-rules — 分页
- 查询 **ListPointRuleRequest**：`page`, `size`, `name`, `ruleType`, `status` → `PageResult<PointRuleDTO>`

### POST /api/admin/point-rules — 创建
- 请求体 **CreatePointRuleRequest**：`name*`, `description`, `ruleType*`(FIXED/EVENT/PERFORMANCE/HOLIDAY), `pointValueMin*`(int), `pointValueMax*`(int), `triggerCondition`, `status`(int) → **PointRuleDTO**

### PUT /api/admin/point-rules/{id} — 更新
- 路径 `id*`；请求体 **UpdatePointRuleRequest**（同 Create + `id*`）→ **PointRuleDTO**

### PATCH /api/admin/point-rules/{id}/status — 启停
- 请求体 **UpdatePointRuleStatusRequest**：`status*`(int) → **PointRuleDTO**

## 3.4 自动发放配置（ADMIN）

### GET /api/admin/points/config — 获取发放配置
- 响应 **DistributionConfigDTO**：`amount`(int), `cycle`(string，默认 MONTHLY), `grantDay`(int 1-28), `enabled`(bool), `targetRole`(string), `updatedAt`

### PUT /api/admin/points/config — 更新配置
- 请求体 **UpdateDistributionConfigRequest**：`amount*`(int>0), `cycle`, `grantDay`(1-28), `enabled`, `targetRole`
- 校验失败 → `POINT_CONFIG_INVALID` → 响应 **DistributionConfigDTO**

### GET /api/admin/points/config/stats — 发放统计
- 查询：`month`(string YYYY-MM，默认当月)
- 响应 **PointGrantStatsDTO**：`month`, `grantedTotal`(int), `coveredEmployees`(int), `lastGrantedAt`

## 3.5 内部
### POST /api/internal/points/adjust — 积分调整（auth/order 调用）
- 请求体 **AdjustPointRequest**：`userId*`, `amount*`, `direction`(INIT/DEDUCT/ADD), `type`, `description` → **PointAccountDTO**
### POST /api/internal/points/distribute — 手动触发全员发放（@Scheduled 月度自动执行；`enabled=false` 跳过）

**PointTransactionDTO**: `id`, `userId`, `type`(EARN/REDEEM/ADJUST/INIT/DISTRIBUTION), `amount`, `balance`, `description`, `createdAt`

---

# 4. Order Service（兑换 / 订单）

## 4.1 员工兑换

### POST /api/orders — 兑换下单（登录）
> Saga：先扣积分 → 再扣库存，任一失败补偿回滚；跨服务 3s 超时。
- 请求体 **ExchangeRequest**：`productId*`(long), `quantity`(int，默认1), `userId*`(long), `employeeName`(string)
- 响应 **ExchangeRecordDTO**

### GET /api/orders — 我的兑换记录分页（登录）
- 查询 **ListMyExchangeRequest**：`page`, `size`, `userId*`(long), `status`(string) → `PageResult<ExchangeRecordDTO>`

### GET /api/orders/{id} — 兑换详情（登录）
- 路径 `id*`(long) → **ExchangeRecordDTO**

## 4.2 兑换管理（ADMIN）

### GET /api/admin/orders — 全部兑换记录分页
- 查询 **ListExchangeRecordRequest**：`page`, `size`, `keyword`, `status`, `startTime`, `endTime` → `PageResult<ExchangeRecordDTO>`

### GET /api/admin/orders/{id} — 详情 → **ExchangeRecordDTO**

### GET /api/admin/orders/stats — 统计
- 响应 **ExchangeRecordStatsDTO**：`totalCount`, `pendingDeliveryCount`, `completedCount`, `totalPointsConsumed`

### PUT /api/admin/orders/{id}/status — 更新状态
- 路径 `id*`；请求体 **UpdateExchangeStatusRequest**：`status*`(string), `trackingNumber`(string)
- 状态流转校验（BR-ORDER-006）：`PENDING_DELIVERY → DELIVERING | CANCELLED`；`DELIVERING → COMPLETED | CANCELLED`；取消时自动退积分 + 恢复库存
- 响应 **ExchangeRecordDTO**

**ExchangeRecordDTO**: `id`, `orderNo`, `productId`, `productName`, `productDesc`, `productImageUrl`, `userId`, `employeeName`, `quantity`, `pointsCost`, `exchangeTime`, `status`, `trackingNumber`, `createdAt`, `updatedAt`

---

## 附：在线 / 机器可读文档
- **统一规范（权威）**：`awsomeshop-openapi.yaml` / `awsomeshop-openapi.json`（与本文件同目录）
  - 合并 4 服务全部端点（38 路径 / 45 接口 / 72 schema），路径均带网关前缀（`/auth/api/...`、`/product/api/...`、`/point/api/...`、`/order/api/...`），`servers = http://localhost:8088`
  - 可直接导入 Postman / Apifox / ReDoc，或用 openapi-generator 生成客户端 SDK
- 统一 Swagger UI（网关，下拉切换 4 服务）：`http://localhost:8088/swagger-ui.html`
- 各服务 OpenAPI JSON：`GET http://localhost:{8001-8004}/v3/api-docs`，离线快照见 `{auth,product,point,order}-openapi.json`（不含网关前缀）
- 重新导出方式见 `README.md`
