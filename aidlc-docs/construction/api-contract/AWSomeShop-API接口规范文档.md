# AWSomeShop API 接口规范文档

> **版本**: v1.1  
> **更新日期**: 2026-06-10  
> **用途**: 前后端团队协作契约，前端据此调用 API，后端据此实现 API  
> **基础路径**: `http://{gateway-host}:8080`  
> **认证方式**: JWT Bearer Token（在 Header 中传递 `Authorization: Bearer {token}`）  
> **风格**: RESTful — 按语义使用 GET/POST/PUT/DELETE 方法

---

## 目录

1. [通用约定](#通用约定)
2. [认证模块 Auth](#1-认证模块-auth)
3. [用户管理模块 User](#2-用户管理模块-user)
4. [产品模块 Product](#3-产品模块-product)
5. [分类模块 Category](#4-分类模块-category)
6. [积分模块 Points](#5-积分模块-points)
7. [兑换/交易模块 Order](#6-兑换交易模块-order)
8. [内部接口（仅服务间调用）](#7-内部接口仅服务间调用)

---

## 通用约定

### 请求方式
- 遵循 RESTful 风格，按语义使用不同 HTTP 方法：
  - **GET**: 查询/获取资源（无请求体，参数通过 URL Path 或 Query String 传递）
  - **POST**: 创建资源、执行动作（如登录、兑换）
  - **PUT**: 全量/部分更新资源
  - **DELETE**: 删除资源
- 请求体格式（POST/PUT）: `application/json`
- 字符编码: `UTF-8`
- GET 请求的分页和筛选参数通过 Query String 传递，如 `?pageNum=1&pageSize=10&keyword=耳机`

### 统一响应信封

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 业务状态码，200=成功，非200=失败 |
| message | string | 状态描述 |
| data | object/array/null | 业务数据 |

### 业务错误码

| 错误码 | 含义 | 场景 |
|--------|------|------|
| 200 | 成功 | 正常响应 |
| 400 | 参数错误 | 请求参数校验失败 |
| 401 | 未认证 | Token 缺失或无效 |
| 403 | 无权限 | 角色权限不足 |
| 404 | 资源不存在 | 查询的资源不存在 |
| 409 | 业务冲突 | 如用户名已存在、库存不足、积分不足 |
| 429 | 频率限制 | 请求过于频繁 |
| 500 | 服务器错误 | 系统内部异常 |

### 分页约定

**GET 请求分页参数**（通过 Query String）:
```
GET /api/v1/public/products?pageNum=1&pageSize=10&keyword=耳机
```

**响应格式**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [...],
    "total": 100,
    "pageNum": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 认证规则

| 路径前缀 | 认证要求 |
|---------|---------|
| `/api/v1/public/auth/login` | 无需认证 |
| `/api/v1/public/auth/register` | 无需认证 |
| `/api/v1/public/**` | 需要 JWT Token |
| `/api/v1/admin/**` | 需要 JWT Token + ADMIN 角色 |
| `/api/v1/internal/**` | 仅服务间调用（网关不转发） |

---

## 1. 认证模块 Auth

### 1.1 用户注册

**POST** `/api/v1/public/auth/register`  
**认证**: 无需  
**关联故事**: US-001

**请求体**:
```json
{
  "username": "liming",
  "password": "Pass1234!",
  "nickname": "李明",
  "employeeId": "EMP001"
}
```

| 字段 | 类型 | 必填 | 校验规则 |
|------|------|------|---------|
| username | string | 是 | 4-20位字母数字下划线，唯一 |
| password | string | 是 | 8-32位，须含字母和数字 |
| nickname | string | 是 | 1-50位中英文 |
| employeeId | string | 是 | 工号，唯一 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "username": "liming",
    "nickname": "李明",
    "role": "EMPLOYEE"
  }
}
```

**失败响应** (409):
```json
{
  "code": 409,
  "message": "用户名已存在",
  "data": null
}
```

---

### 1.2 用户登录

**POST** `/api/v1/public/auth/login`  
**认证**: 无需  
**关联故事**: US-002, US-025

**请求体**:
```json
{
  "username": "liming",
  "password": "Pass1234!"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJSUzI1NiIsInR...",
    "userId": 1,
    "username": "liming",
    "nickname": "李明",
    "role": "EMPLOYEE",
    "expiresIn": 86400
  }
}
```

**失败响应** (401):
```json
{
  "code": 401,
  "message": "用户名或密码错误",
  "data": null
}
```

**账号锁定响应** (429):
```json
{
  "code": 429,
  "message": "账号已锁定，请15分钟后重试",
  "data": {
    "lockExpiredAt": "2026-06-10T12:30:00Z"
  }
}
```

---

### 1.3 用户登出

**POST** `/api/v1/public/auth/logout`  
**认证**: 需要  
**关联故事**: US-003

**请求体**: 空 `{}`

**成功响应** (200):
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

---

### 1.4 获取当前用户信息

**GET** `/api/v1/public/auth/me`  
**认证**: 需要  
**说明**: 获取当前登录用户的详细信息

**请求参数**: 无（用户身份从 Token 中解析）

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 1,
    "username": "liming",
    "nickname": "李明",
    "employeeId": "EMP001",
    "role": "EMPLOYEE",
    "status": "ACTIVE",
    "lastLoginAt": "2026-06-10T08:00:00Z",
    "createdAt": "2026-06-01T10:00:00Z"
  }
}
```

---

### 1.5 修改密码

**PUT** `/api/v1/public/auth/password`  
**认证**: 需要  
**说明**: 用户自助修改密码

**请求体**:
```json
{
  "oldPassword": "Pass1234!",
  "newPassword": "NewPass5678!"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| oldPassword | string | 是 | 当前密码 |
| newPassword | string | 是 | 新密码，8-32位 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": null
}
```

---

## 2. 用户管理模块 User

### 2.1 用户列表（管理员）

**GET** `/api/v1/admin/users`  
**认证**: ADMIN  
**关联故事**: US-020

**Query 参数**:
```
GET /api/v1/admin/users?pageNum=1&pageSize=10&keyword=李&role=EMPLOYEE&status=ACTIVE
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10，最大50 |
| keyword | string | 否 | 按姓名/工号/用户名模糊搜索 |
| role | string | 否 | 角色筛选: EMPLOYEE/ADMIN |
| status | string | 否 | 状态筛选: ACTIVE/LOCKED/DISABLED |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "userId": 1,
        "username": "liming",
        "nickname": "李明",
        "employeeId": "EMP001",
        "role": "EMPLOYEE",
        "status": "ACTIVE",
        "pointBalance": 1500,
        "lastLoginAt": "2026-06-10T08:00:00Z",
        "createdAt": "2026-06-01T10:00:00Z"
      }
    ],
    "total": 50,
    "pageNum": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

---

### 2.2 启用/禁用用户（管理员）

**PUT** `/api/v1/admin/users/{userId}/status`  
**认证**: ADMIN

**路径参数**: `userId` — 用户ID

**请求体**:
```json
{
  "status": "DISABLED"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | ACTIVE/DISABLED |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "用户状态更新成功",
  "data": null
}
```

---

## 3. 产品模块 Product

### 3.1 产品列表（员工浏览）

**GET** `/api/v1/public/products`  
**认证**: 需要  
**关联故事**: US-004, US-005, US-007

**Query 参数**:
```
GET /api/v1/public/products?pageNum=1&pageSize=12&categoryId=5&keyword=耳机&sortBy=createdAt&sortOrder=DESC
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认12 |
| categoryId | long | 否 | 分类ID筛选（含子分类下的商品） |
| keyword | string | 否 | 按产品名称模糊搜索 |
| status | string | 否 | 状态: ACTIVE/SOLD_OUT，员工端默认仅返回ACTIVE |
| sortBy | string | 否 | 排序字段: createdAt/price/name，默认createdAt |
| sortOrder | string | 否 | ASC/DESC，默认DESC |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "productId": 1,
        "name": "Sony WH-1000XM5 无线降噪耳机",
        "description": "行业领先降噪，30小时续航",
        "imageUrl": "https://cdn.example.com/products/sony-xm5.jpg",
        "price": 500,
        "categoryId": 5,
        "categoryName": "无线耳机",
        "quantity": 20,
        "status": "ACTIVE",
        "createdAt": "2026-06-01T10:00:00Z"
      }
    ],
    "total": 50,
    "pageNum": 1,
    "pageSize": 12,
    "totalPages": 5
  }
}
```

---

### 3.2 产品详情

**GET** `/api/v1/public/products/{productId}`  
**认证**: 需要  
**关联故事**: US-006

**路径参数**: `productId` — 产品ID

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "productId": 1,
    "name": "Sony WH-1000XM5 无线降噪耳机",
    "description": "行业领先降噪，30小时续航，舒适佩戴设计",
    "imageUrl": "https://cdn.example.com/products/sony-xm5.jpg",
    "price": 500,
    "categoryId": 5,
    "categoryName": "无线耳机",
    "categoryPath": "电子产品 > 耳机 > 无线耳机",
    "quantity": 20,
    "status": "ACTIVE",
    "createdAt": "2026-06-01T10:00:00Z",
    "updatedAt": "2026-06-05T15:00:00Z"
  }
}
```

---

### 3.3 创建产品（管理员）

**POST** `/api/v1/admin/products`  
**认证**: ADMIN  
**关联故事**: US-013

**请求体**:
```json
{
  "name": "Sony WH-1000XM5 无线降噪耳机",
  "description": "行业领先降噪，30小时续航",
  "imageUrl": "https://cdn.example.com/products/sony-xm5.jpg",
  "price": 500,
  "categoryId": 5,
  "quantity": 50
}
```

| 字段 | 类型 | 必填 | 校验规则 |
|------|------|------|---------|
| name | string | 是 | 1-100字符 |
| description | string | 否 | 最长500字符 |
| imageUrl | string | 否 | 合法URL |
| price | int | 是 | 正整数（所需积分） |
| categoryId | long | 是 | 有效的分类ID |
| quantity | int | 是 | >= 0 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "产品创建成功",
  "data": {
    "productId": 1
  }
}
```

---

### 3.4 更新产品（管理员）

**PUT** `/api/v1/admin/products/{productId}`  
**认证**: ADMIN  
**关联故事**: US-014

**路径参数**: `productId` — 产品ID

**请求体**:
```json
{
  "name": "Sony WH-1000XM5 无线降噪耳机（新色）",
  "description": "行业领先降噪，30小时续航，新增午夜蓝配色",
  "imageUrl": "https://cdn.example.com/products/sony-xm5-blue.jpg",
  "price": 550,
  "categoryId": 5,
  "quantity": 30
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 所有字段 | - | 否 | 仅传需要修改的字段 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "产品更新成功",
  "data": null
}
```

---

### 3.5 更新产品状态（管理员）

**PUT** `/api/v1/admin/products/{productId}/status`  
**认证**: ADMIN  
**关联故事**: US-015

**路径参数**: `productId` — 产品ID

**请求体**:
```json
{
  "status": "INACTIVE"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | ACTIVE/INACTIVE/SOLD_OUT |

**说明**: `INACTIVE` = 下架（逻辑删除），员工端不可见

---

### 3.6 产品列表（管理员视角）

**GET** `/api/v1/admin/products`  
**认证**: ADMIN  
**关联故事**: US-016

**Query 参数**: 同 3.1，但 `status` 支持 ACTIVE/INACTIVE/SOLD_OUT/ALL

**与员工列表的区别**:
- 返回所有状态的产品（含下架）
- 额外字段: `totalExchangeCount`（历史兑换次数）

---

## 4. 分类模块 Category

### 4.1 分类树（员工/管理员共用）

**GET** `/api/v1/public/categories/tree`  
**认证**: 需要  
**关联故事**: US-004

**请求参数**: 无

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "categoryId": 1,
      "name": "电子产品",
      "description": "电子设备及配件",
      "parentId": null,
      "sortOrder": 1,
      "children": [
        {
          "categoryId": 4,
          "name": "耳机",
          "description": "各类耳机",
          "parentId": 1,
          "sortOrder": 1,
          "children": [
            {
              "categoryId": 5,
              "name": "无线耳机",
              "description": "",
              "parentId": 4,
              "sortOrder": 1,
              "children": []
            }
          ]
        }
      ]
    },
    {
      "categoryId": 2,
      "name": "生活用品",
      "description": "日常生活物品",
      "parentId": null,
      "sortOrder": 2,
      "children": []
    }
  ]
}
```

---

### 4.2 创建分类（管理员）

**POST** `/api/v1/admin/categories`  
**认证**: ADMIN  
**关联故事**: US-017

**请求体**:
```json
{
  "name": "无线耳机",
  "description": "蓝牙无线耳机",
  "parentId": 4,
  "sortOrder": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 分类名称，1-50字符 |
| description | string | 否 | 描述 |
| parentId | long | 否 | 父分类ID，不填则为一级分类 |
| sortOrder | int | 否 | 排序值，默认0 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "分类创建成功",
  "data": {
    "categoryId": 5
  }
}
```

---

### 4.3 更新分类（管理员）

**PUT** `/api/v1/admin/categories/{categoryId}`  
**认证**: ADMIN  
**关联故事**: US-018

**路径参数**: `categoryId` — 分类ID

**请求体**:
```json
{
  "name": "无线蓝牙耳机",
  "description": "支持蓝牙5.0+的无线耳机",
  "sortOrder": 2
}
```

---

### 4.4 删除分类（管理员）

**DELETE** `/api/v1/admin/categories/{categoryId}`  
**认证**: ADMIN  
**关联故事**: US-019

**路径参数**: `categoryId` — 分类ID

**请求体**: 无

**失败响应 — 分类下有产品** (409):
```json
{
  "code": 409,
  "message": "该分类下存在产品，请先移除产品或转移至其他分类",
  "data": null
}
```

**失败响应 — 有子分类** (409):
```json
{
  "code": 409,
  "message": "该分类下存在子分类，请先删除子分类",
  "data": null
}
```

---

## 5. 积分模块 Points

### 5.1 查询积分余额（员工）

**GET** `/api/v1/public/points/balance`  
**认证**: 需要  
**关联故事**: US-008

**请求参数**: 无（从 Token 中获取用户身份）

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 1,
    "balance": 1500,
    "totalEarned": 3000,
    "totalUsed": 1500
  }
}
```

---

### 5.2 积分变动历史（员工）

**GET** `/api/v1/public/points/transactions`  
**认证**: 需要  
**关联故事**: US-009

**Query 参数**:
```
GET /api/v1/public/points/transactions?pageNum=1&pageSize=20&type=EARN
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 默认1 |
| pageSize | int | 否 | 默认20 |
| type | string | 否 | 筛选类型: EARN/USE/ALL，默认ALL |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "transactionId": 100,
        "type": "EARN",
        "amount": 100,
        "reason": "系统每月自动发放",
        "beforeBalance": 1400,
        "afterBalance": 1500,
        "operatorName": "系统",
        "createdAt": "2026-06-01T00:00:00Z"
      },
      {
        "transactionId": 99,
        "type": "USE",
        "amount": -500,
        "reason": "兑换商品: Sony WH-1000XM5",
        "beforeBalance": 1900,
        "afterBalance": 1400,
        "operatorName": null,
        "createdAt": "2026-05-28T14:30:00Z"
      }
    ],
    "total": 25,
    "pageNum": 1,
    "pageSize": 20,
    "totalPages": 2
  }
}
```

---

### 5.3 管理员查看全员积分列表

**GET** `/api/v1/admin/points/accounts`  
**认证**: ADMIN  
**关联故事**: US-020

**Query 参数**:
```
GET /api/v1/admin/points/accounts?pageNum=1&pageSize=10&keyword=李明&sortBy=balance&sortOrder=DESC
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 默认1 |
| pageSize | int | 否 | 默认10 |
| keyword | string | 否 | 按员工姓名/工号搜索 |
| sortBy | string | 否 | balance/totalEarned/totalUsed，默认balance |
| sortOrder | string | 否 | ASC/DESC |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "userId": 1,
        "nickname": "李明",
        "employeeId": "EMP001",
        "balance": 1500,
        "totalEarned": 3000,
        "totalUsed": 1500,
        "lastTransactionAt": "2026-06-01T00:00:00Z"
      }
    ],
    "total": 50,
    "pageNum": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

---

### 5.4 管理员手动调整积分

**POST** `/api/v1/admin/points/adjust`  
**认证**: ADMIN  
**关联故事**: US-021  
**说明**: 这是一个"动作"型接口，非 CRUD，使用 POST

**请求体**:
```json
{
  "userId": 1,
  "amount": 200,
  "reason": "Q2季度绩效奖励"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | long | 是 | 目标用户ID |
| amount | int | 是 | 正数=发放，负数=扣除 |
| reason | string | 是 | 调整原因，不可为空 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "积分调整成功",
  "data": {
    "userId": 1,
    "adjustedAmount": 200,
    "newBalance": 1700
  }
}
```

**失败响应 — 余额不足** (409):
```json
{
  "code": 409,
  "message": "扣除后余额不足，当前余额: 1500，请求扣除: 2000",
  "data": null
}
```

---

### 5.5 管理员查看员工积分明细

**GET** `/api/v1/admin/points/transactions`  
**认证**: ADMIN  
**关联故事**: US-020

**Query 参数**:
```
GET /api/v1/admin/points/transactions?userId=1&pageNum=1&pageSize=20&type=ALL
```

**响应格式**: 同 5.2，但可查看任意员工

---

### 5.6 积分规则列表（管理员）

**GET** `/api/v1/admin/point-rules`  
**认证**: ADMIN  
**关联故事**: US-022

**Query 参数**:
```
GET /api/v1/admin/point-rules?pageNum=1&pageSize=10
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "ruleId": 1,
        "name": "每月自动发放",
        "description": "每月1日自动为所有在职员工发放积分",
        "ruleType": "MONTHLY_GRANT",
        "pointValue": 100,
        "status": "ACTIVE",
        "cronExpression": "0 0 0 1 * ?",
        "createdAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-06-01T00:00:00Z"
      }
    ],
    "total": 3,
    "pageNum": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

---

### 5.7 创建/更新积分规则（管理员）

**POST** `/api/v1/admin/point-rules` — 创建  
**PUT** `/api/v1/admin/point-rules/{ruleId}` — 更新  
**认证**: ADMIN  
**关联故事**: US-022

**请求体（创建）**:
```json
{
  "name": "每月自动发放",
  "description": "每月1日自动发放",
  "ruleType": "MONTHLY_GRANT",
  "pointValue": 100,
  "cronExpression": "0 0 0 1 * ?"
}
```

**请求体（更新）**:
```json
{
  "ruleId": 1,
  "pointValue": 150,
  "status": "ACTIVE"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 创建时必填 | 规则名称 |
| ruleType | string | 创建时必填 | MONTHLY_GRANT/BONUS/MANUAL |
| pointValue | int | 是 | 发放积分值，正整数 |
| cronExpression | string | 否 | 定时发放 cron 表达式 |
| status | string | 否 | ACTIVE/INACTIVE |

---

### 5.8 启用/禁用积分规则

**PUT** `/api/v1/admin/point-rules/{ruleId}/status`  
**认证**: ADMIN

**路径参数**: `ruleId` — 规则ID

**请求体**:
```json
{
  "status": "INACTIVE"
}
```

---

## 6. 兑换/交易模块 Order

### 6.1 发起兑换（员工）

**POST** `/api/v1/public/orders/exchange`  
**认证**: 需要  
**关联故事**: US-010, US-011  
**说明**: 这是一个"动作"型接口（发起兑换事务），使用 POST

**请求体**:
```json
{
  "productId": 1,
  "quantity": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| productId | long | 是 | 产品ID |
| quantity | int | 是 | 兑换数量，正整数，默认1 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "兑换成功",
  "data": {
    "orderId": 1,
    "orderNo": "ORD-20260610-00001",
    "productId": 1,
    "productName": "Sony WH-1000XM5 无线降噪耳机",
    "quantity": 1,
    "pointsCost": 500,
    "status": "SUCCESS",
    "exchangeTime": "2026-06-10T14:30:00Z",
    "pickupInfo": "请于工作日 9:00-17:00 到 B1 行政中心领取"
  }
}
```

**失败响应 — 积分不足** (409):
```json
{
  "code": 409,
  "message": "积分不足，当前余额: 300，所需积分: 500",
  "data": null
}
```

**失败响应 — 库存不足** (409):
```json
{
  "code": 409,
  "message": "商品库存不足",
  "data": null
}
```

---

### 6.2 员工兑换历史

**GET** `/api/v1/public/orders`  
**认证**: 需要  
**关联故事**: US-012

**Query 参数**:
```
GET /api/v1/public/orders?pageNum=1&pageSize=10&status=ALL
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 默认1 |
| pageSize | int | 否 | 默认10 |
| status | string | 否 | SUCCESS/PICKED_UP/COMPLETED/ALL |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "orderId": 1,
        "orderNo": "ORD-20260610-00001",
        "productId": 1,
        "productName": "Sony WH-1000XM5 无线降噪耳机",
        "productImageUrl": "https://cdn.example.com/products/sony-xm5.jpg",
        "quantity": 1,
        "pointsCost": 500,
        "status": "SUCCESS",
        "exchangeTime": "2026-06-10T14:30:00Z"
      }
    ],
    "total": 5,
    "pageNum": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

---

### 6.3 兑换详情

**GET** `/api/v1/public/orders/{orderId}`  
**认证**: 需要  
**关联故事**: US-012

**路径参数**: `orderId` — 订单ID

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "orderId": 1,
    "orderNo": "ORD-20260610-00001",
    "productId": 1,
    "productName": "Sony WH-1000XM5 无线降噪耳机",
    "productDescription": "行业领先降噪，30小时续航",
    "productImageUrl": "https://cdn.example.com/products/sony-xm5.jpg",
    "quantity": 1,
    "pointsCost": 500,
    "status": "SUCCESS",
    "statusHistory": [
      { "status": "SUCCESS", "changedAt": "2026-06-10T14:30:00Z", "operator": null }
    ],
    "exchangeTime": "2026-06-10T14:30:00Z",
    "pickupInfo": "请于工作日 9:00-17:00 到 B1 行政中心领取",
    "createdAt": "2026-06-10T14:30:00Z",
    "updatedAt": "2026-06-10T14:30:00Z"
  }
}
```

---

### 6.4 管理员兑换记录列表

**GET** `/api/v1/admin/orders`  
**认证**: ADMIN  
**关联故事**: US-023

**Query 参数**:
```
GET /api/v1/admin/orders?pageNum=1&pageSize=10&keyword=李明&status=SUCCESS&startTime=2026-06-01T00:00:00Z&endTime=2026-06-30T23:59:59Z
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | int | 否 | 默认1 |
| pageSize | int | 否 | 默认10 |
| keyword | string | 否 | 按员工姓名/产品名搜索 |
| status | string | 否 | SUCCESS/PICKED_UP/COMPLETED/ALL |
| startTime | string | 否 | 开始时间筛选 (ISO 8601) |
| endTime | string | 否 | 结束时间筛选 (ISO 8601) |

**成功响应**: 同 6.2 格式，额外包含 `employeeName` 和 `employeeId` 字段

---

### 6.5 管理员更新兑换状态

**PUT** `/api/v1/admin/orders/{orderId}/status`  
**认证**: ADMIN  
**关联故事**: US-024

**路径参数**: `orderId` — 订单ID

**请求体**:
```json
{
  "status": "PICKED_UP",
  "remark": "员工已自取"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | 目标状态 |
| remark | string | 否 | 备注 |

**状态流转规则**: `SUCCESS` → `PICKED_UP` → `COMPLETED`（单向，不可逆）

**失败响应 — 非法状态变更** (409):
```json
{
  "code": 409,
  "message": "非法状态变更: 不允许从 COMPLETED 变更为 PICKED_UP",
  "data": null
}
```

---

### 6.6 兑换统计（管理员）

**GET** `/api/v1/admin/orders/stats`  
**认证**: ADMIN

**Query 参数**:
```
GET /api/v1/admin/orders/stats?startTime=2026-06-01T00:00:00Z&endTime=2026-06-30T23:59:59Z
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalExchanges": 150,
    "totalPointsSpent": 75000,
    "totalItemsExchanged": 165,
    "uniqueUsers": 45,
    "topProducts": [
      { "productId": 1, "productName": "Sony WH-1000XM5", "exchangeCount": 20 },
      { "productId": 3, "productName": "星巴克礼品卡", "exchangeCount": 35 }
    ]
  }
}
```

---

## 7. 内部接口（仅服务间调用）

> ⚠️ 以下接口由 API Gateway 屏蔽，不对外暴露，仅供服务间通过 FeignClient 直接调用。

### 7.1 Token 校验（Gateway → Auth）

**POST** `/api/v1/internal/auth/validate`

**请求体**:
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR..."
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "userId": 1,
    "role": "EMPLOYEE"
  }
}
```

---

### 7.2 积分初始化（Auth → Points）

**POST** `/api/v1/internal/point/initialize`

**请求体**:
```json
{
  "userId": 1,
  "initialBalance": 0
}
```

---

### 7.3 积分扣减/恢复（Order → Points）

**POST** `/api/v1/internal/point/deduct`

**请求体**:
```json
{
  "userId": 1,
  "amount": 500,
  "reason": "兑换商品: Sony WH-1000XM5",
  "orderNo": "ORD-20260610-00001"
}
```

**POST** `/api/v1/internal/point/restore`

**请求体**:
```json
{
  "userId": 1,
  "amount": 500,
  "reason": "兑换失败回滚",
  "orderNo": "ORD-20260610-00001"
}
```

---

### 7.4 库存扣减/恢复（Order → Product）

**POST** `/api/v1/internal/product/deduct-stock`

**请求体**:
```json
{
  "productId": 1,
  "quantity": 1,
  "orderNo": "ORD-20260610-00001"
}
```

**POST** `/api/v1/internal/product/restore-stock`

**请求体**:
```json
{
  "productId": 1,
  "quantity": 1,
  "orderNo": "ORD-20260610-00001"
}
```

---

## 附录

### A. 枚举值速查表

| 枚举 | 可选值 | 说明 |
|------|--------|------|
| 用户角色 | EMPLOYEE, ADMIN | 员工/管理员 |
| 用户状态 | ACTIVE, LOCKED, DISABLED | 正常/锁定/禁用 |
| 产品状态 | ACTIVE, INACTIVE, SOLD_OUT | 在售/下架/售罄 |
| 分类状态 | ACTIVE, INACTIVE | 可用/停用 |
| 积分变动类型 | EARN, USE | 获得/使用 |
| 积分规则类型 | MONTHLY_GRANT, BONUS, MANUAL | 月度自动/奖励/手动 |
| 兑换状态 | SUCCESS, PICKED_UP, COMPLETED, FAILED, CANCELLED | 兑换成功/已自取/已完成/失败/已取消 |

### B. 接口总览

| 模块 | 端点数 | 员工端 | 管理端 | 内部 |
|------|--------|--------|--------|------|
| Auth | 5 | 5 | 0 | 1 |
| User | 2 | 0 | 2 | 0 |
| Product | 6 | 2 | 4 | 2 |
| Category | 4 | 1 | 3 | 0 |
| Points | 8 | 2 | 6 | 3 |
| Order | 6 | 3 | 3 | 0 |
| **合计** | **31** | **13** | **18** | **6** |

### C. 版本变更记录

| 版本 | 日期 | 变更说明 |
|------|------|---------|
| v1.0 | 2026-06-10 | 初始版本，覆盖全部 25 个用户故事的 API 定义 |
| v1.1 | 2026-06-10 | 重构为 RESTful 风格，按语义使用 GET/POST/PUT/DELETE 方法，URL 改为复数名词资源路径 |
