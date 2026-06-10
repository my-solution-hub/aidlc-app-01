# AWSomeShop API 文档（OpenAPI 3 / Swagger）

本目录为各微服务自动生成的 **OpenAPI 3.0 标准规范**，包含每个端点的完整请求参数、请求体/响应 DTO schema、字段类型、校验约束、错误响应。由各服务的 springdoc（`springdoc-openapi-starter-webmvc-ui`）在运行时生成并导出。

## 文件清单

### 合并规范（推荐，带网关前缀）
| 文件 | 路径 | Schema | 说明 |
|---|---|---|---|
| `awsomeshop-openapi.yaml` | 38 路径 / 45 接口 | 72 | 4 服务合并，路径含网关前缀 `/auth /product /point /order`，`servers=http://localhost:8088`，可直接经网关试调 |
| `awsomeshop-openapi.json` | 同上 | 72 | 同上，JSON 格式 |

### 各服务单独规范（不含网关前缀，服务本地视图）
| 服务 | 端口 | 规范文件 | 端点数 | Schema 数 |
|---|---|---|---|---|
| auth-service | 8001 | `auth-openapi.json` | 10 | 15 |
| product-service | 8002 | `product-openapi.json` | 15 | 19 |
| point-service | 8003 | `point-openapi.json` | 13 | 28 |
| order-service | 8004 | `order-openapi.json` | 7 | 10 |

> 路径全部为 RESTful（`/api/...`），含 DTO 字段定义与校验注解（`@NotBlank`/`@Min` 等映射为 schema 的 required/minimum）。

## 查看方式

### 1. Swagger UI（交互式，推荐）
各服务启动后访问（可直接试调）：
- auth:    http://localhost:8001/swagger-ui/index.html
- product: http://localhost:8002/swagger-ui/index.html
- point:   http://localhost:8003/swagger-ui/index.html
- order:   http://localhost:8004/swagger-ui/index.html

经网关统一访问（聚合）：http://localhost:8088/swagger-ui/index.html

### 2. 原始 OpenAPI JSON
- 运行时：`GET http://localhost:{port}/v3/api-docs`
- 离线快照：本目录 `*-openapi.json`

### 3. 导入到工具
这些 JSON 可直接导入 Postman / Insomnia / Apifox / ReDoc / openapi-generator 生成客户端 SDK。

## 重新导出（代码变更后刷新快照）
```bash
# 1. 启动 4 个服务后，导出各服务单独规范：
for svc in auth:8001 product:8002 point:8003 order:8004; do
  name=${svc%%:*}; port=${svc##*:}
  curl -s http://localhost:$port/v3/api-docs -o api-docs/$name-openapi.json
done
# 2. 合并为带网关前缀的统一规范（python，前缀 /auth /product /point /order）：
#    见仓库内合并脚本；产出 awsomeshop-openapi.{json,yaml}
```

## 补充
- 人类可读的中文摘要版见本目录 `API接口文档.md`（含认证分层、错误码约定、Olivia 缺口覆盖表）。
- 统一响应信封 `Result<T>`：`{code, message, data}`，`code="SUCCESS"` 为成功。
- 认证：`Authorization: Bearer <JWT>`；`/api/admin/**` 经网关强制 role=ADMIN。
