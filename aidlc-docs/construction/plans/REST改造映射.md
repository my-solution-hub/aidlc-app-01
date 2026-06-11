# REST 改造映射（RPC → REST）

> 目标：前后端 API 全改 REST 风格，对齐规格；生成后端标准 API 文档。
> 路由约定：PUBLIC `/api/...`（员工/公开）、ADMIN `/api/admin/...`（网关 RBAC 强制 ADMIN）、INTERNAL `/api/internal/...`（仅内部调用）。
> 网关路由改为按 `/api/admin/**`(需ADMIN) / `/api/internal/**`(拒绝外部) / 其余 `/api/**`(部分 public 部分 authenticated)。

## Auth Service
| 当前 RPC | 目标 REST |
|---|---|
| POST /api/v1/public/auth/login | POST /api/auth/login |
| POST /api/v1/public/auth/logout | POST /api/auth/logout |
| POST /api/v1/public/auth/register | POST /api/auth/register |
| POST /api/v1/public/auth/me | GET /api/users/me |
| POST /api/v1/public/auth/user/list | GET /api/admin/users |
| POST /api/v1/public/auth/user/get | GET /api/admin/users/{id} |
| POST /api/v1/public/auth/user/update | PUT /api/admin/users/{id} |
| POST /api/v1/public/auth/user/create | POST /api/admin/users |
| POST /api/v1/public/auth/user/update-status | PATCH /api/admin/users/{id}/status |
| POST /api/v1/internal/auth/validate | POST /api/internal/auth/validate（保留，内部）|

## Product Service
| 当前 | 目标 |
|---|---|
| POST product/list | GET /api/products（分页/搜索 query）|
| POST product/get | GET /api/products/{id} |
| POST product/create | POST /api/admin/products |
| POST product/update | PUT /api/admin/products/{id} |
| POST product/delete | DELETE /api/admin/products/{id} |
| POST product/update-status | PATCH /api/admin/products/{id}/status |
| POST category/list | GET /api/categories/tree |
| POST category/create | POST /api/admin/categories |
| POST category/update | PUT /api/admin/categories/{id} |
| POST category/delete | DELETE /api/admin/categories/{id} |
| POST category/update-status | PATCH /api/admin/categories/{id}/status |
| GET file/{filename} | GET /api/files/{filename} |
| POST file/upload | POST /api/files/upload |
| POST internal/product/deduct-stock | POST /api/internal/products/deduct-stock |
| POST internal/product/restore-stock | POST /api/internal/products/restore-stock |

## Points Service
| 当前 | 目标 |
|---|---|
| POST point/balance | GET /api/points/balance（userId query/header）|
| POST point/transaction/list | GET /api/points/transactions |
| POST internal/point/adjust | POST /api/internal/points/adjust |
| POST admin/point/config/get | GET /api/admin/points/config |
| POST admin/point/config/update | PUT /api/admin/points/config |
| POST internal/point/distribute | POST /api/internal/points/distribute |
| POST admin/point-rule/list | GET /api/admin/point-rules |
| POST admin/point-rule/create | POST /api/admin/point-rules |
| POST admin/point-rule/update | PUT /api/admin/point-rules/{id} |
| POST admin/point-rule/update-status | PATCH /api/admin/point-rules/{id}/status |

## Order Service
| 当前 | 目标 |
|---|---|
| POST public/order/exchange | POST /api/orders |
| POST public/order/list | GET /api/orders |
| POST public/order/get | GET /api/orders/{id} |
| POST admin/exchange-record/list | GET /api/admin/orders |
| POST admin/exchange-record/get | GET /api/admin/orders/{id} |
| POST admin/exchange-record/stats | GET /api/admin/orders/stats |
| POST admin/exchange-record/update-status | PUT /api/admin/orders/{id}/status |

## 删除项
- 所有 `/api/v1/public/test/*`（Test 脚手架残留）—— 清理

## 前端改造
- src/services/api/*.ts 全部改为对应 REST 动词 + 路径 + query/path 参数
- request.ts baseURL 不变（指网关），路径去掉 `/{service}/api/v1/...` 前缀改 `/api/...`
- 网关需能从 `/api/...` 路由到对应服务（按资源前缀：/api/products→product, /api/orders→order, /api/points→points, /api/auth + /api/users→auth, /api/categories+/api/files→product, /api/admin/{users}→auth, /api/admin/{products,categories}→product, /api/admin/{points,point-rules}→points, /api/admin/orders→order）

## 验证 ✅ 全部完成
- [x] 4 后端 controller 改 REST（auth/product/points/order）+ 删除全部 Test 脚手架
- [x] order ExchangeRemoteClient 改调新 REST/internal 路径
- [x] gateway 路由改按资源前缀 + auth 分层 + RBAC（/admin/ → ADMIN）+ validate-url 修正 + files POST 路由 + 删 TestController
- [x] 前端 src/services/api/*.ts 全部改 REST 动词/路径 + request.ts 加 patch
- [x] 5 后端 mvn BUILD SUCCESS + 前端 npm build ✅
- [x] codex 验证 5 项一致性：前后端路径/动词匹配、order client、gateway 路由、文档；发现 4 处不一致已全部修复并复验 RESOLVED
- [x] 生成标准 API 文档：api-docs/API接口文档.md（+ 各服务 springdoc /v3/api-docs 运行时自动生成）

## 最终状态
前后端 API 已完整 REST 化并一致；标准接口文档已生成。运行时 OpenAPI 由 springdoc 自动暴露。
