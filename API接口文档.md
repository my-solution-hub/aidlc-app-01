# AWSomeShop 后端 API 接口文档（REST）

> 版本：v1 · 风格：RESTful · 统一经 API 网关（默认 http://localhost:8088）访问
> 所有响应统一信封：`{ "code": "SUCCESS", "message": "操作成功", "data": <T> }`（`code != "SUCCESS"` 为业务错误）
> 认证：`Authorization: Bearer <JWT>`。网关对 `/api/admin/**` 强制校验角色为 ADMIN（否则 403）。
> 在线文档：各服务启动后 `GET /v3/api-docs/{auth|product|point|order}`（Swagger/OpenAPI 自动生成）。

## 认证分层
| 层级 | 路径 | 要求 |
|---|---|---|
| PUBLIC | `POST /api/auth/*`、`GET /api/products`、`GET /api/categories/tree`、`GET /api/files/**` | 无需登录 |
| AUTHENTICATED | `/api/users/me`、`/api/orders/**`、`/api/points/**` | 任意已登录用户 |
| ADMIN | `/api/admin/**` | 角色必须为 ADMIN |
| INTERNAL | `/api/internal/**` | 仅服务间调用，不经网关暴露 |

---

## 1. Auth Service（认证 / 用户）

### 认证
| 方法 | 路径 | 说明 | 请求 | 响应 data |
|---|---|---|---|---|
| POST | `/api/auth/login` | 登录 | `{username, password}` | `{token, userId, username, nickname, role}` |
| POST | `/api/auth/logout` | 登出 | Header `Authorization` | — |
| POST | `/api/auth/register` | 注册（注册后自动初始化积分账户） | `{username, password, nickname?, employeeId?}` | `UserDTO` |
| GET | `/api/users/me` | 当前用户信息 | Header `Authorization` / `X-Operator-Id` | `UserDTO` |

### 用户管理（ADMIN）
| 方法 | 路径 | 说明 | 请求 |
|---|---|---|---|
| GET | `/api/admin/users?page=&size=&username=&role=&status=` | 用户分页 | query |
| POST | `/api/admin/users` | 新建用户 | `{username,password,nickname,role,employeeId?}` |
| GET | `/api/admin/users/{id}` | 用户详情 | path |
| PUT | `/api/admin/users/{id}` | 更新用户 | `{nickname,role,employeeId}` |
| PATCH | `/api/admin/users/{id}/status` | 启用/禁用 | `{status}` (ACTIVE/DISABLED) |

**UserDTO**: `{id, username, nickname, role, status, employeeId, lastLoginAt, createdAt}`

### 内部
| POST | `/api/internal/auth/validate` | 网关校验 token | `{token}` → `{success, operatorId, role, message}`（裸 JSON，非信封）|

---

## 2. Product Service（商品 / 分类 / 文件）

### 商品（PUBLIC 读 / ADMIN 写）
| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/products?page=&size=&name=&category=` | 商品分页/搜索 |
| GET | `/api/products/{id}` | 商品详情 |
| POST | `/api/admin/products` | 创建商品 |
| PUT | `/api/admin/products/{id}` | 更新商品 |
| DELETE | `/api/admin/products/{id}` | 删除商品 |
| PATCH | `/api/admin/products/{id}/status` | 上/下架 `{status}`(0/1) |

**ProductDTO**: `{id, name, sku, category, brand, pointsPrice, marketPrice, stock, soldCount, status, description, imageUrl, ...}`

### 分类（PUBLIC 读 / ADMIN 写，≤2 级）
| GET | `/api/categories/tree` | 分类树 |
| POST | `/api/admin/categories` | 创建（parentId 可选；超 2 级拒绝）|
| PUT | `/api/admin/categories/{id}` | 更新 |
| DELETE | `/api/admin/categories/{id}` | 删除 |
| PATCH | `/api/admin/categories/{id}/status` | 启停 |

### 文件
| POST | `/api/files/upload` | 上传图片（multipart `file`，≤5MB，jpg/png/gif/webp）→ `{filename, url}` |
| GET | `/api/files/{filename}` | 读取图片 |

### 内部
| POST | `/api/internal/products/deduct-stock` | 扣库存（悲观锁）`{productId, quantity}` |
| POST | `/api/internal/products/restore-stock` | 回补库存 `{productId, quantity}` |

---

## 3. Points Service（积分账户 / 规则）

### 员工积分
| GET | `/api/points/balance?userId=` | 积分余额 → `{userId, balance, totalEarned, totalUsed}` |
| GET | `/api/points/transactions?userId=&page=&size=&type=` | 积分流水分页 |

### 积分规则（ADMIN）
| GET | `/api/admin/point-rules?page=&size=` | 规则分页 |
| POST | `/api/admin/point-rules` | 创建规则 |
| PUT | `/api/admin/point-rules/{id}` | 更新规则 |
| PATCH | `/api/admin/point-rules/{id}/status` | 启停 `{status}` |

### 发放配置（ADMIN）
| GET | `/api/admin/points/config` | 获取自动发放额度 → `{amount, updatedAt}` |
| PUT | `/api/admin/points/config` | 更新额度 `{amount}` |

### 内部
| POST | `/api/internal/points/adjust` | 积分调整 `{userId, amount, direction(INIT/DEDUCT/ADD), type, description}` |
| POST | `/api/internal/points/distribute` | 手动触发全员发放（@Scheduled 月度自动执行）|

---

## 4. Order Service（兑换 / 订单）

### 员工兑换
| POST | `/api/orders` | 兑换下单（Saga：先扣积分→扣库存，失败补偿）`{productId, quantity, userId, employeeName?}` → `ExchangeRecordDTO` |
| GET | `/api/orders?userId=&page=&size=&status=` | 我的兑换记录分页 |
| GET | `/api/orders/{id}` | 兑换详情 |

### 兑换管理（ADMIN）
| GET | `/api/admin/orders?page=&size=&keyword=&status=` | 全部兑换记录分页 |
| GET | `/api/admin/orders/{id}` | 详情 |
| GET | `/api/admin/orders/stats` | 统计 → `{totalCount, pendingDeliveryCount, completedCount, totalPointsConsumed}` |
| PUT | `/api/admin/orders/{id}/status` | 更新状态（流转校验 + 取消自动退积分/恢复库存）`{status, trackingNumber?}` |

**ExchangeRecordDTO**: `{id, orderNo, productId, productName, productImageUrl, userId, employeeName, quantity, pointsCost, status, exchangeTime, trackingNumber, createdAt, updatedAt}`
**状态流转**: `PENDING_DELIVERY → DELIVERING | CANCELLED`；`DELIVERING → COMPLETED | CANCELLED`

---

## 错误码约定（前缀决定 HTTP 状态）
| 前缀 | HTTP | 含义 |
|---|---|---|
| `SUCCESS` | 200 | 成功 |
| `PARAM_*` | 400 | 参数错误 |
| `AUTH_*` | 401 | 未认证 |
| `AUTHZ_*` | 403 | 无权限（非 ADMIN 访问 admin 接口）|
| `NOT_FOUND_*` | 404 | 资源不存在 |
| `CONFLICT_*` | 409 | 冲突（库存/积分不足、唯一约束）|
| `SYS_*` | 500 | 系统错误 |
