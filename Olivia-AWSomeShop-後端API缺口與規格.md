# AWSomeShop 後端 API 缺口與規格（Backend API Gap & Spec）

> 目的：根據 `AWSomeShop-前端需求差距分析.md` 的結論，整理「前端要完整接後端，後端還缺哪些 API」，並依現有實作慣例給出每支 API 的規格（endpoint / request / response / DTO / 錯誤碼），以及前端 service 應新增的函式簽名。
>
> - 需求來源：`AWSomeShop-前端需求差距分析.md`（US-006/011/020/021/022、business-rules 6.2 等）
> - 慣例來源：`awsome-shop-frontend/src/services/api/*.ts`、`src/services/request.ts`、`src/types/api.ts`
> - 分析日期：2026-06-10
> - 圖例：🔴 必須新增（阻塞 Must Have）　🟡 建議新增（體驗/一致性）　✅ 已存在可直接用

---

## 一、結論摘要

對照差距分析，前端要把缺失功能接起來，後端**真正缺少的端點集中在 3 個區塊、共約 8 支**：

| # | 區塊 | 對應故事 | 缺口 | 優先級 |
|---|---|---|---|---|
| 1 | 管理-員工積分列表 + 明細 | US-020 | `user-point/list`、`user-point/detail` | 🔴 P0 |
| 2 | 管理-手動調整積分 | US-021 | `user-point/adjust` | 🔴 P0 |
| 3 | 管理-積分自動發放配置 + 統計 | US-022 | `point-config/get`、`point-config/save`、`point-config/stats` | 🔴 P0 |
| 4 | 檔案/圖片上傳 | business-rules 6.2、NFR-FE | `file/upload` | 🔴 P0 |
| 5 | 註冊工號欄位 | US-001 | `register` 加 `employeeNo`（含 `UserDTO`） | 🔴 P0 |
| 6 | 兌換金額試算（兌換後餘額） | US-011 | `order/preview`（可選，否則前端組合既有 API） | 🟡 P1 |

**好消息**：差距分析中的「商品詳情頁（US-006）」「分類串接（US-004）」「各列表分頁（US-004/007/009/012）」**後端皆已具備端點**，屬前端整合工作，不需新增後端 API（詳見第四節）。

> 注意：所有端點延續現有 **POST 風格 RPC + `Result<T>` 包裝**慣例。若團隊決定改走 RESTful，需另議。

---

## 二、共用慣例（所有 API 通用）

### 2.1 回應包裝 `Result<T>`

後端統一回傳，由前端 `request.ts` 攔截器解包，成功時直接回傳 `data`：

```json
{ "code": "SUCCESS", "message": "ok", "data": { /* T */ } }
```

業務失敗時 `code != "SUCCESS"`，前端拋出 `BusinessError(code, message)`。

### 2.2 分頁 `PageResult<T>`

```json
{
  "code": "SUCCESS",
  "message": "ok",
  "data": { "current": 1, "size": 20, "total": 135, "pages": 7, "records": [ /* T[] */ ] }
}
```

### 2.3 通用約定

- **方法**：一律 `POST`，body 為 JSON（檔案上傳例外，用 `multipart/form-data`）。
- **認證**：除登入/註冊外皆需 `Authorization: Bearer <jwt>`；管理端 (`/admin/*`) 需 `role=admin`。
- **路徑前綴**：依服務切分 — `auth` / `product` / `point` / `order` / `file`，版本 `api/v1`，再分 `public`（員工/通用）與 `admin`（管理端）。
- **狀態欄位**：沿用現有 `status` 慣例（多數模組 `number`：1 啟用 / 0 停用；user 模組為 `string`）。

### 2.4 建議錯誤碼（新增 API 用）

| code | 場景 |
|---|---|
| `SUCCESS` | 成功 |
| `POINT_BALANCE_NOT_ENOUGH` | 調整/兌換後餘額為負 |
| `POINT_USER_NOT_FOUND` | 員工不存在 |
| `POINT_CONFIG_INVALID` | 發放配置參數非法（額度≤0、週期非法） |
| `FILE_TYPE_NOT_ALLOWED` | 非 jpg/png/gif |
| `FILE_TOO_LARGE` | 超過 5MB |
| `EMPLOYEE_NO_DUPLICATED` | 註冊工號重複 |
| `PARAM_INVALID` | 一般參數校驗失敗 |
| `FORBIDDEN` | 非管理員存取 admin 端點 |

---

## 三、缺失 API 規格（逐支）

### 🔴 區塊 1：管理端 — 員工積分列表 / 明細（US-020）

服務前綴：`/point/api/v1/admin/user-point`

#### 3.1.1 員工積分列表 `POST /point/api/v1/admin/user-point/list`

查詢全體員工的積分餘額，支援姓名/工號搜尋與分頁。

Request：
```json
{ "page": 1, "size": 20, "keyword": "张" }
```

Response（`PageResult<UserPointDTO>`）：
```json
{
  "current": 1, "size": 20, "total": 56, "pages": 3,
  "records": [
    {
      "userId": 1001,
      "username": "zhangsan",
      "nickname": "张三",
      "employeeNo": "E20230012",
      "balance": 3200,
      "totalEarned": 8000,
      "totalUsed": 4800,
      "updatedAt": "2026-06-01T09:00:00"
    }
  ]
}
```

`UserPointDTO`：

| 欄位 | 型別 | 說明 |
|---|---|---|
| userId | number | 員工 ID |
| username | string | 登入帳號 |
| nickname | string | 姓名 |
| employeeNo | string | 工號（依需求需新增欄位） |
| balance | number | 當前餘額 |
| totalEarned | number | 累計獲得 |
| totalUsed | number | 累計使用 |
| updatedAt | string | 最後變動時間 |

#### 3.1.2 員工積分明細 `POST /point/api/v1/admin/user-point/detail`

點擊某員工查看其積分變動明細（US-020「點擊看明細」）。

Request：
```json
{ "userId": 1001, "page": 1, "size": 20, "type": "ADJUST" }
```

Response：`PageResult<PointTransactionDTO>`（沿用既有 `PointTransactionDTO`，`type` 枚舉 `EARN/SPEND/ADJUST/REFUND`）。

> 替代方案：既有員工端 `POST /point/api/v1/public/point/transaction/list` 已可帶 `userId` 查明細。若後端允許管理員以該端點查任意 userId，可不新增本支；但基於權限隔離，建議新增 admin 變體。

---

### 🔴 區塊 2：管理端 — 手動調整積分（US-021）

#### 3.2.1 `POST /point/api/v1/admin/user-point/adjust`

對單一員工正向增加或負向扣減積分，必填原因；扣減後不可為負。

Request：
```json
{ "userId": 1001, "amount": -500, "reason": "违规扣减" }
```

| 欄位 | 型別 | 必填 | 規則 |
|---|---|---|---|
| userId | number | ✅ | 員工存在，否則 `POINT_USER_NOT_FOUND` |
| amount | number | ✅ | 非 0 整數；正=增、負=減 |
| reason | string | ✅ | 1–200 字，空則 `PARAM_INVALID` |

Response（`PointBalanceDTO` 調整後餘額，沿用既有型別）：
```json
{ "userId": 1001, "balance": 2700, "totalEarned": 8000, "totalUsed": 5300 }
```

業務規則：
- 扣減後 `balance < 0` → 回 `POINT_BALANCE_NOT_ENOUGH`，不寫入。
- 成功同時寫一筆 `PointTransaction`（`type=ADJUST`，`description=reason`）。

---

### 🔴 區塊 3：管理端 — 積分自動發放配置（US-022）

服務前綴：`/point/api/v1/admin/point-config`

#### 3.3.1 取得配置 `POST /point/api/v1/admin/point-config/get`

Request：`{}`（單例配置）

Response（`PointGrantConfigDTO`）：
```json
{
  "id": 1,
  "amount": 1000,
  "cycle": "MONTHLY",
  "grantDay": 1,
  "enabled": true,
  "targetRole": "employee",
  "updatedAt": "2026-06-01T00:00:00"
}
```

`PointGrantConfigDTO`：

| 欄位 | 型別 | 說明 |
|---|---|---|
| id | number | 配置 ID |
| amount | number | 每次發放額度（>0） |
| cycle | string | 發放週期：`MONTHLY`（目前需求僅每月） |
| grantDay | number | 每月發放日（1–28） |
| enabled | boolean | 是否啟用自動發放 |
| targetRole | string | 發放對象角色，預設 `employee` |
| updatedAt | string | 最後更新時間 |

#### 3.3.2 儲存配置 `POST /point/api/v1/admin/point-config/save`

Request：
```json
{ "amount": 1000, "cycle": "MONTHLY", "grantDay": 1, "enabled": true, "targetRole": "employee" }
```

校驗：`amount<=0` 或 `grantDay∉[1,28]` 或 `cycle` 非法 → `POINT_CONFIG_INVALID`。
Response：`PointGrantConfigDTO`（儲存後）。

#### 3.3.3 發放統計 `POST /point/api/v1/admin/point-config/stats`

供 PointRules 頁統計卡「本月發放 / 覆蓋員工」用（目前顯示佔位「—」）。

Request：`{ "month": "2026-06" }`（可選，預設當月）
Response（`PointGrantStatsDTO`）：
```json
{ "month": "2026-06", "grantedTotal": 56000, "coveredEmployees": 56, "lastGrantedAt": "2026-06-01T00:05:00" }
```

---

### 🔴 區塊 4：檔案 / 圖片上傳（business-rules 6.2、商品圖片）

#### 3.4.1 `POST /file/api/v1/public/file/upload`

商品新增/編輯上傳圖片用。`multipart/form-data`，欄位名 `file`。

Request（form-data）：

| 欄位 | 型別 | 說明 |
|---|---|---|
| file | binary | 圖片檔；jpg/png/gif，≤5MB |
| bizType | string（可選） | 業務類型，如 `product` |

校驗：副檔名非 jpg/png/gif → `FILE_TYPE_NOT_ALLOWED`；>5MB → `FILE_TOO_LARGE`。

Response（`UploadResultDTO`）：
```json
{ "url": "https://cdn.example.com/product/2026/06/abc123.png", "fileName": "abc123.png", "size": 204800 }
```

> 前端取回 `url` 後填入商品表單的 `imageUrl`。實作可落地 S3/OSS 或本地靜態目錄，回傳可公開存取的 URL 即可。

---

### 🔴 區塊 5：認證 — 註冊新增「工號」欄位（US-001）

US-001 要求註冊填寫**工號**，但現有 `RegisterRequest` 與 `UserDTO` 皆無此欄位。屬欄位擴充而非新端點。

#### 3.5.1 既有端點擴充 `POST /auth/api/v1/public/auth/register`

Request（新增 `employeeNo`）：
```json
{ "username": "zhangsan", "password": "Passw0rd", "nickname": "张三", "employeeNo": "E20230012" }
```

| 欄位 | 型別 | 必填 | 規則 |
|---|---|---|---|
| username | string | ✅ | 3–20 位，唯一 |
| password | string | ✅ | 長度依收斂結果（≥6 或 ≥8，見差距分析規格衝突） |
| nickname | string | 可選 | 姓名 |
| employeeNo | string | ✅ | 工號，唯一；重複回 `EMPLOYEE_NO_DUPLICATED` |

#### 3.5.2 連帶調整

- `UserDTO` 新增 `employeeNo` 欄位（使用者管理列表、員工積分列表 `UserPointDTO` 共用）。
- 使用者資料表新增 `employee_no` 欄位（唯一索引）。
- 新增錯誤碼 `EMPLOYEE_NO_DUPLICATED`。

> 此欄位同時被區塊 1 的 `UserPointDTO.employeeNo` 依賴，建議優先定稿。

---

### 🟡 區塊 6：兌換金額試算 / 兌換後餘額（US-011，可選）

US-011 要求確認頁顯示「當前餘額、所需積分、**兌換後餘額**」並在餘額不足時禁用。

- **方案 A（不新增後端）**：前端在確認頁組合既有 `POST /point/api/v1/public/point/balance` + `POST /product/api/v1/public/product/get`，本地計算 `兌換後餘額 = balance - pointsPrice * quantity`。**推薦**，最省。
- **方案 B（新增試算端點）**：`POST /order/api/v1/public/order/preview`

  Request：`{ "productId": 88, "quantity": 1, "userId": 1001 }`
  Response（`ExchangePreviewDTO`）：
  ```json
  { "productName": "保温杯", "pointsCost": 800, "currentBalance": 3200, "balanceAfter": 2400, "stockEnough": true, "balanceEnough": true }
  ```

  優點：扣減邏輯與庫存判斷集中於後端，避免前後端各算一次。

---

## 四、已具備、無需新增（前端整合即可）

| 差距分析項目 | 對應故事 | 既有端點 | 說明 |
|---|---|---|---|
| 商品詳情頁 | US-006 | `POST /product/api/v1/public/product/get` | `getProduct(id)` 已存在，前端補 `/products/:id` 頁即可 |
| 分類串接（取代硬編碼） | US-004 | `POST /product/api/v1/public/category/list` | `listCategories` 已存在，含 `children` 二級樹 |
| 員工端分頁/無限滾動 | US-004/007/009/012 | 各 `*/list` 已收 `page`/`size` | 後端分頁已支援，前端改傳 `size:20` 並做無限滾動 |
| 兌換單號顯示 | US-010 | `POST /order/api/v1/public/order/exchange` | 回傳 `ExchangeRecordDTO.orderNo` 已含單號 |
| 積分餘額 / 明細 | US-008/009 | `point/balance`、`point/transaction/list` | 已存在，前端補 `type` 中文映射即可 |

---

## 五、前端 service 待新增清單（依本規格）

需新增兩個 service 檔與一個工具，型別補進 `src/types/api.ts`：

```typescript
// src/services/api/userPoint.ts   （US-020 / US-021）
const BASE = '/point/api/v1/admin/user-point';
export function listUserPoints(data: ListUserPointRequest): Promise<PageResult<UserPointDTO>>;        // /list
export function getUserPointDetail(data: ListPointTransactionRequest): Promise<PageResult<PointTransactionDTO>>; // /detail
export function adjustPoints(data: AdjustPointRequest): Promise<PointBalanceDTO>;                       // /adjust

// src/services/api/pointConfig.ts （US-022）
const CFG = '/point/api/v1/admin/point-config';
export function getPointConfig(): Promise<PointGrantConfigDTO>;                 // /get
export function savePointConfig(data: SavePointConfigRequest): Promise<PointGrantConfigDTO>; // /save
export function getPointGrantStats(month?: string): Promise<PointGrantStatsDTO>; // /stats

// src/services/api/file.ts （圖片上傳）
export function uploadFile(file: File, bizType?: string): Promise<UploadResultDTO>; // multipart → /file/api/v1/public/file/upload
```

對應新增型別（`src/types/api.ts`）：`UserPointDTO`、`ListUserPointRequest`、`AdjustPointRequest`、`PointGrantConfigDTO`、`SavePointConfigRequest`、`PointGrantStatsDTO`、`UploadResultDTO`、（可選）`ExchangePreviewDTO`。

---

## 六、附錄：端點總表

| 方法 | 端點 | 認證 | 故事 | 狀態 |
|---|---|---|---|---|
| POST | `/point/api/v1/admin/user-point/list` | admin | US-020 | 🔴 新增 |
| POST | `/point/api/v1/admin/user-point/detail` | admin | US-020 | 🔴 新增 |
| POST | `/point/api/v1/admin/user-point/adjust` | admin | US-021 | 🔴 新增 |
| POST | `/point/api/v1/admin/point-config/get` | admin | US-022 | 🔴 新增 |
| POST | `/point/api/v1/admin/point-config/save` | admin | US-022 | 🔴 新增 |
| POST | `/point/api/v1/admin/point-config/stats` | admin | US-022 | 🔴 新增 |
| POST | `/file/api/v1/public/file/upload` | 登入 | BR 6.2 | 🔴 新增 |
| POST | `/auth/api/v1/public/auth/register` | 公開 | US-001 | 🔴 加 `employeeNo` 欄位 |
| POST | `/order/api/v1/public/order/preview` | 登入 | US-011 | 🟡 可選 |
| POST | `/product/api/v1/public/product/get` | 登入 | US-006 | ✅ 已有 |
| POST | `/product/api/v1/public/category/list` | 登入 | US-004 | ✅ 已有 |

---

*本規格依現有前端 service 的 POST-RPC + `Result<T>` 慣例推導，作為後端補齊與前後端對齊的依據。實際欄位（尤其 `employeeNo` 工號、發放週期 `cycle`）建議於 `awsome-shop-plan` 收斂後定稿，再據以實作。*
