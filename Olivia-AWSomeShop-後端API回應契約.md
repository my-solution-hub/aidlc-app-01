# AWSomeShop 前端所需 API 回應契約（Response Contract）

> 目的：明確告訴後端「**每支 API 要回傳什麼資訊給前端**」。這是**前端的資料需求**，權威來源為前端型別宣告 `awsome-shop-frontend/src/types/api.ts`（前端預期收到的結構＝後端應回傳的結構）。
>
> - 與 Swagger 的分工：Swagger 描述「後端目前回什麼」（自動產生）；本檔描述「前端需要回什麼」（需求），可用來檢查後端是否漏回欄位。
> - 來源：`types/api.ts` + 各頁面實際取用欄位
> - 日期：2026-06-10
> - 契約現況：前端 service 已 REST 對齊後端（commit `1302e4c`）。

---

## 一、共用結構

### 統一回應包裝 `Result<T>`
所有端點都用這個外層包裝（前端 `request.ts` 攔截器靠 `code === "SUCCESS"` 解包，取 `data`）：

```jsonc
{
  "code": "SUCCESS",      // string；成功固定 "SUCCESS"，業務錯誤回其他碼
  "message": "ok",         // string；錯誤時前端會顯示此訊息
  "data": { /* T */ }      // 實際資料
}
```

### 分頁 `PageResult<T>`
列表類端點的 `data` 用此結構：

| 欄位 | 型別 | 意義 / 前端用途 |
|---|---|---|
| `current` | number | 當前頁碼 |
| `size` | number | 每頁筆數 |
| `total` | number | 總筆數（前端顯示「共 N 筆」） |
| `pages` | number | 總頁數（前端分頁器） |
| `records` | T[] | 當頁資料陣列 |

---

## 二、認證 / 使用者

### 登入 `POST /api/auth/login` → `LoginResponse`

| 欄位 | 型別 | 必回 | 前端用途 |
|---|---|---|---|
| `token` | string | ✅ | 存 localStorage，後續請求帶 `Bearer` |
| `userId` | number | ✅ | 後續 `getBalance(userId)` 等 |
| `username` | string | ✅ | 顯示 |
| `nickname` | string | ✅ | 顯示名（store 存為 `displayName`） |
| `role` | string | ✅ | 角色守衛（前端會 `toLowerCase()`，需含 employee/admin 語意） |

### 註冊 `POST /api/auth/register` → `UserDTO`；登出 `POST /api/auth/logout` → 無 data

### 使用者 `UserDTO`（`GET /api/admin/users` 分頁、`/api/users/me`）

| 欄位 | 型別 | 前端用途 |
|---|---|---|
| `id` | number | 主鍵 |
| `username` | string | 列表顯示 |
| `nickname` | string | 列表顯示 |
| `role` | string | 角色欄（admin/employee） |
| `status` | string | 啟用/停用狀態（**字串**，與其他模組 number 不同，請維持） |
| `lastLoginAt` | string | 最近登入時間 |
| `createdAt` | string | 建立時間 |

> 註：前端「註冊工號」尚未實作；若要支援，需在 `LoginResponse`/`UserDTO`/`RegisterRequest` 增 `employeeId`。

---

## 三、商品 / 分類

### 商品 `ProductDTO`（`GET /api/products` 分頁、`GET /api/products/{id}`）

| 欄位 | 型別 | 必回 | 前端用途 |
|---|---|---|---|
| `id` | number | ✅ | 主鍵、路由 |
| `name` | string | ✅ | 名稱 |
| `sku` | string | ✅ | 編號（管理端） |
| `category` | string | ✅ | 分類名（前端用名稱比對/篩選） |
| `brand` | string | ◐ | 品牌 |
| `pointsPrice` | number | ✅ | 積分價（卡片/詳情/兌換計算） |
| `marketPrice` | number | ◐ | 市場參考價 |
| `stock` | number | ✅ | 庫存（售罄判斷 `stock<=0`） |
| `soldCount` | number | ◐ | 已兌換數 |
| `status` | number | ✅ | 上下架（`1`=上架；前端據此禁用兌換） |
| `description` | string | ◐ | 詳情描述 |
| `imageUrl` | string | ◐ | 圖片（空則顯示佔位 icon） |
| `subtitle/deliveryMethod/serviceGuarantee/promotion/colors` | string | ◐ | 詳情輔助欄位 |
| `specs` | `Record<string,string>[]` | ◐ | 規格參數（key-value 陣列） |
| `createdAt/updatedAt` | string | ◐ | 時間 |

> ◐ = 可為空，但**欄位需存在**（前端用可選鏈/預設值處理）。`status` 與 `stock` 是兌換流程關鍵，務必正確回傳。

### 分類 `CategoryDTO`（`GET /api/categories/tree`，回 `CategoryDTO[]` 樹形）

| 欄位 | 型別 | 前端用途 |
|---|---|---|
| `id` | number | 主鍵 |
| `name` | string | 名稱 |
| `parentId` | number \| null | 父分類（null=一級） |
| `icon` | string | 圖示 |
| `sortOrder` | number | 排序 |
| `status` | number | 啟用/停用（1/0） |
| `description` | string | 描述 |
| `productCount` | number | 商品數（管理列表顯示） |
| `children` | CategoryDTO[] | 子分類（二級樹） |

---

## 四、積分

### 餘額 `GET /api/points/balance?userId=` → `PointBalanceDTO`

| 欄位 | 型別 | 前端用途 |
|---|---|---|
| `userId` | number | 對應使用者 |
| `balance` | number | 當前餘額（首頁/積分中心/兌換計算） |
| `totalEarned` | number | 累計獲得 |
| `totalUsed` | number | 累計使用 |

### 積分明細 `GET /api/points/transactions` 分頁 → `PointTransactionDTO`

| 欄位 | 型別 | 前端用途 |
|---|---|---|
| `id` | number | 主鍵 |
| `type` | string | 類型（前端映射中文：`EARN`/`SPEND`/`ADJUST`/`REFUND` 等，請回固定枚舉值） |
| `amount` | number | 變動量（正負，前端用色彩 + 正負號） |
| `balance` | number | 變動後餘額 |
| `description` | string | 說明 |
| `createdAt` | string | 時間 |

### 積分規則 `PointRuleDTO`（`GET /api/admin/point-rules` 分頁）
`id / name / description / ruleType / pointValueMin / pointValueMax / triggerCondition / status / createdAt / updatedAt`。

---

## 五、訂單 / 兌換記錄

### 兌換記錄 `ExchangeRecordDTO`
（員工：`POST /api/orders`、`GET /api/orders`、`GET /api/orders/{id}`；管理：`GET /api/admin/orders*`）

| 欄位 | 型別 | 必回 | 前端用途 |
|---|---|---|---|
| `id` | number | ✅ | 主鍵 |
| `orderNo` | string | ✅ | 訂單編號（兌換成功顯示） |
| `productName` | string | ✅ | 商品名 |
| `productDesc` | string | ◐ | 商品描述 |
| `employeeName` | string | ✅ | 兌換員工（管理端） |
| `pointsCost` | number | ✅ | 消耗積分 |
| `exchangeTime` | string | ✅ | 兌換時間 |
| `status` | string | ✅ | 狀態枚舉（**需與前端對齊**，見下方待決） |
| `trackingNumber` | string | ◐ | 物流單號（管理端更新狀態時用） |
| `createdAt/updatedAt` | string | ◐ | 時間 |

### 兌換統計 `GET /api/admin/orders/stats` → `ExchangeRecordStatsDTO`

| 欄位 | 型別 | 前端用途 |
|---|---|---|
| `totalCount` | number | 總兌換數 |
| `pendingDeliveryCount` | number | 待發貨數 |
| `completedCount` | number | 已完成數 |
| `totalPointsConsumed` | number | 消耗積分總計 |

---

## 六、待決：狀態枚舉值需對齊

`ExchangeRecordDTO.status` 的字串值，前端目前對應到這些文案：
`PENDING_DELIVERY`(待發貨) / `DELIVERING`(配送中) / `PROCESSING`(處理中) / `COMPLETED`(已完成) / `CANCELLED`(已取消)。

**請後端確認實際回傳的 status 字串與此一致**（或三方收斂一套），否則前端狀態標籤會顯示不出來。

---

## 附：怎麼維護這份文件

- 本檔是「前端資料需求」，以 `types/api.ts` 為準；前端型別變動時同步更新。
- 「後端目前實際回什麼」請以 **Swagger（自動產生）** 為準：gateway `/swagger-ui` 或各服務 `/v3/api-docs/{auth|product|point|order}`。
- 後端可拿本檔逐欄位核對：Swagger 的回應 schema 是否涵蓋前端需要的每個欄位；缺的就是要補回傳的。
