# AWSomeShop 前端功能清單（已驗證版）

> 以**實際程式碼**為準（前端頁面 / service 層 + 後端 controller + gateway 路由皆查證過）。判斷標準：
> - **A 類（視為完成）**：前端 UI + 呼叫程式碼已寫好，後端正常供資料即可運作。
> - **B 類（不完整）**：前端本身缺頁面/欄位/邏輯，需補（括號內標後端狀態）。
>
> - 來源：`awsome-shop-frontend/src/`；四個後端服務 controller；gateway 路由
> - 更新：**2026-06-10**，已納入 ① 設計稿對齊 PR #5（員工/管理端缺頁 + 彈窗）② 後端 `d60274e 補齊積分管理缺口` ③ `API接口文档.md v1.1`。
> - 更新：**2026-06-11**，對賬後端 MVP（`965abd1` 10 項缺口已完成、62 測試通過）：刷新 D 節狀態——D-1～D-7 設計稿依賴**仍待後端補充開發**（詳見 D 節狀態橫幅）。
> - 後端依賴統一見本檔 **D 節**（原 `後端API缺口與規格.md` 已於 `2ebf9dd` 移除，需求併入此處，不再另開檔案）。

---

## ✅ 前後端契約：已對齊

前端 service 層已於 `1302e4c` 改為標準 REST，與後端一致。回應包裝 `Result<T>` / `PageResult<T>` 兩邊一致。

| 前端 service | 後端端點 | 一致 |
|---|---|---|
| `auth.ts` → `POST /api/auth/login` 等 | 同 | ✅ |
| `product.ts` → `GET /api/products`、`/api/admin/products/**` | 同 | ✅ |
| `point.ts` → `GET /api/points/balance`、`/transactions` | 同 | ✅ |
| `userPoint`（管理端積分）→ `/api/admin/points/users`、`/adjust`、`/config/stats` | 同（`d60274e` 已補齊） | ✅ |
| `order.ts` → `POST /api/orders`、`GET /api/orders` | 同 | ✅ |
| `category / user / pointRule / exchangeRecord / file` | 對應 `/api/...` REST | ✅ |

> 小提醒（非契約問題）：`request.ts` baseURL 預設 `http://localhost:8088`（即 gateway 埠）；部署時用 `VITE_API_BASE_URL` 覆蓋即可。

---

## A. 前端已完整（後端供資料即可用）

| 功能 | 頁面 | 對應後端 |
|---|---|---|
| 登入 / 登出 / 角色守衛 | Login / AuthGuard | `/api/auth/login`、`/logout` |
| 商品列表 + 搜尋 + **分類動態化** | ShopHome | `GET /api/products`、`GET /api/categories/tree` |
| 商品詳情頁 | ProductDetail | `GET /api/products/{id}` |
| 兌換流程：確認頁 → **兌換成功頁**（含兌換後餘額/餘額不足禁用） | ConfirmRedemption / **RedemptionSuccess** | `/api/products/{id}`、`/api/points/balance`、`POST /api/orders` |
| **訂單詳情頁（狀態時間線）** | **OrderDetail** `/orders/:id` | `GET /api/orders/{id}` |
| **兌換記錄改造**（狀態 Tab / 搜尋 / 卡片 / 分頁 / 詳情入口） | MyOrders | `GET /api/orders` |
| **積分中心改造**（漸變大卡 / 快捷入口 / 獲取途徑 / 收支篩選） | MyPoints | `/api/points/balance`、`/api/points/transactions` |
| 管理-商品管理（列表/新增/編輯/刪除） | Products | `/api/products`、`/api/admin/products/**` |
| **管理-商品詳情頁** + **下架確認 / 調整庫存 / 上傳圖片** 彈窗 | **ProductDetailAdmin** `/admin/products/:id` | `/api/admin/products/**`、`POST /api/files/upload` |
| 管理-商品表單**庫存欄位** + 動態分類 | CreateProduct | `/api/admin/products`、`/api/categories/tree` |
| 管理-分類管理 + **狀態開關 / 強確認刪除** | Categories | `/api/categories/tree`、`/api/admin/categories/**` |
| 管理-兌換記錄管理（統計/篩選/匯出） | ExchangeRecords | `/api/admin/orders/**` |
| **管理-兌換詳情頁** + **修改發貨狀態** 彈窗 / 取消訂單 / 列印 | **ExchangeDetail** `/admin/orders/:id` | `/api/admin/orders/{id}`、`/{id}/status` |
| 管理-使用者管理**重構**（統計卡/搜尋+角色篩選/頭像工號/角色 Chip/編輯/匯出） | Users | `/api/admin/users/**` |
| 儀表板 | Dashboard | 組合多個既有 API |
| 註冊（基本） | Register | `POST /api/auth/register` |

---

## B. 不完整（需補前端）

### B-1 後端已就緒，待前端接線（前端 backlog，非後端依賴）
| # | 功能 | 缺什麼（前端） | 後端狀態 |
|---|---|---|---|
| 1 | adm-10 用戶積分變動記錄頁 + dlg-10 手動調整積分（US-020/021） | 缺頁面與彈窗（現有 PointRules 為「規則 CRUD」，與此並存） | ✅ `GET /api/admin/points/users`、`POST /api/admin/points/adjust`、`GET /api/points/transactions?userId=` |
| 2 | adm-07 積分規則頁統計卡「本月發放 / 覆蓋員工」 | 統計卡目前顯示 `—` | ✅ `GET /api/admin/points/config/stats` |
| 3 | adm-03 用戶列「積分餘額」 | 該列目前顯示 `—` | ✅ `GET /api/admin/points/users` |
| 4 | 員工端分頁 / 無限滾動（US-004/007/009/012） | 商品/積分歷史仍 `size:50` 一次抓（MyOrders 已分頁） | ✅ 後端 list 支援分頁 |

### B-2 體驗 / NFR 小項（純前端，無後端依賴）
| # | 功能 | 缺什麼 |
|---|---|---|
| 5 | 積分類型中文映射（US-009） | MyPoints 以 description 顯示，未做 EARN/REDEEM/ADJUST/INIT/DISTRIBUTION → 中文 |
| 6 | 圖片懶加載 + 失敗兜底（NFR-FE-020/021） | 商品圖直接 `<img>`，無 lazy / onError 占位 |
| 7 | 搜尋防抖 300ms | 各搜尋框即時觸發 |
| 8 | 註冊前端校驗（US-001） | 無帳號長度（3–20）/密碼長度校驗 |
| 9 | API 超時（NFR-FE-014） | `request.ts` 15s，需求 10s |
| 10 | 路由懶加載 / 分包 | 主包 ~860KB，建議 `React.lazy` + manualChunks |
| 11 | AppSnackbar lint | `useSnackbar` hook 與元件同檔，觸發 react-refresh 報錯，建議拆檔 |

---

## C. 規格 / 待決事項
| 項目 | 說明 |
|---|---|
| 兌換狀態枚舉 | 前端已**移除多餘的 `PROCESSING`**，對齊後端狀態機 `PENDING_DELIVERY → DELIVERING → COMPLETED / CANCELLED` ✅ |
| 密碼長度 | US-001 ≥8 vs business-rules ≥6，收斂後再做前端校驗 |
| 工號開放範圍 | 註冊已支援 `employeeId`（後端 `RegisterRequest` 已開放）；確認是否允許員工自填 |
| 收貨地址 | 設計稿 emp-05「填寫收貨資訊」頁缺後端地址簿（見 D-3），目前流程跳過該頁 |
| WCAG 2.1 AA | 需手動 + 輔助技術驗證 |

---

## D. 對後端的依賴（仍缺的端點 / 欄位 —— 後端可據此直接開工）

> 契約風格沿用現行 REST（見 `API接口文档.md`）：`/api/...`(PUBLIC/AUTHENTICATED)、`/api/admin/...`(ADMIN)、統一 `Result<T>`。
> 前端對缺口的處理：缺欄位顯示 `—`、缺端點對應按鈕隱藏/禁用，**不造假資料**；後端補齊後前端接線即可。

> 🟥 **狀態（2026-06-11 對賬，⚠️ 需後端補充開發）**：後端已完成自身逆向分析的 MVP 缺口（`965abd1 實現全部 10 項剩餘缺口`，見 `aidlc-docs/inception/reverse-engineering/功能缺口復查報告-v2.md`），P0 全修復。但**以下 D-1～D-7 為設計稿（`.pen`）驅動的需求，不在後端該輪範圍**；經 OpenAPI 契約（`api-docs/awsomeshop-openapi.yaml`）+ 控制器原始碼逐項核對，**仍未實現**。前端目前對這些做降級處理（顯示 `—`／隱藏按鈕），不阻塞。**請後端按下列 REST 契約補充開發**，完成後前端接線即可。
>
> | 編號 | 缺口 | 建議優先級 | 核對結果 |
> |---|---|---|---|
> | D-1 | 用戶部門欄位 + 用戶統計 | P1 | ❌ 無 `department` / `users/stats` |
> | D-2 | 員工確認收貨 | P1 | ❌ 無 `confirm-receipt`（僅管理員可改狀態） |
> | D-3 | 收貨地址簿 + 下單帶地址 | P1 | ❌ 無 `/api/addresses`，`POST /api/orders` 無 `addressId` |
> | D-4 | 兌換記錄 DTO 擴展欄位 | P2 | ❌ `ExchangeRecordDTO` 無 shippingPoints/balanceAfter/statusHistory 等 |
> | D-5 | 積分規則 DTO 擴展欄位 | P2 | ❌ `PointRuleDTO` 無 applicableScope/grantMethod/icon |
> | D-6 | 員工訂單關鍵字搜尋 | P2 | ⚠️ `/api/orders` 未見 `keyword` 參數（管理端 `/api/admin/orders` 有篩選） |
> | D-7 | 商品多圖 `images[]` | P2 | ❌ `ProductDTO` 僅 `imageUrl` 單圖 |

### D-1 用戶「部門」欄位 + 用戶統計（adm-03）
- `UserDTO` 增加 `department`（string，可空）；`POST/PUT /api/admin/users`、`POST /api/auth/register` 支援寫入。
- `GET /api/admin/users/stats`（ADMIN）→ `{ totalUsers, activeUsers, newThisMonth }`。
- 現狀：部門列、活躍/本月新增統計卡顯示 `—`（總用戶數已用列表 total）。

### D-2 員工「確認收貨」（emp-07 / emp-08）
- `POST /api/orders/{id}/confirm-receipt`（AUTHENTICATED，校驗訂單屬當前用戶）→ `ExchangeRecordDTO`（DELIVERING → COMPLETED）。
- 現狀：員工端「確認收貨」按鈕未渲染。

### D-3 收貨地址簿 + 訂單收貨資訊（emp-05 / emp-07 / adm-09）
- 地址簿（AUTHENTICATED）：`GET /api/addresses?userId=`、`POST/PUT/DELETE /api/addresses/{id}`、`PATCH /api/addresses/{id}/default`。
  - `AddressDTO`：`{ id, userId, recipient, phone, province, city, district, detail, zipcode?, isDefault }`。
- 下單帶地址：`POST /api/orders` body 增加 `addressId`，落庫到兌換記錄。

### D-4 兌換記錄 DTO 擴展（adm-09 兌換詳情 / dlg-09）
`ExchangeRecordDTO` 增加：`shippingPoints`、`balanceAfter`、`employeeNo`、`department`、`contact`、`recipient/phone/address`（依 D-3）、`courierCompany`、`remark`、`source`、`statusHistory[]`（`{status,time,note}[]`）。
- 現狀：dlg-09 僅提交 `status + trackingNumber`（後端已支援）；詳情缺欄位顯示 `—`。

### D-5 積分規則 DTO 擴展（dlg-07 / dlg-08）
`PointRuleDTO` 增加：`applicableScope?`（適用範圍）、`grantMethod?`（自動/手動發放）、`icon?`。

### D-6 員工訂單列表關鍵字搜尋（emp-08）
`GET /api/orders?...&keyword=`（按訂單號/商品名）。現狀：前端改為當前頁客戶端過濾（降級）。

### D-7 商品多圖 / 圖廊（adm-04 / emp-03）
`ProductDTO` 增加 `images?: string[]`（首張為主圖），創建/更新支援。現狀：上傳僅設單張主圖 `imageUrl`。

### 端點總表（僅"仍缺"項）
| 方法 | 端點 / 欄位 | 對應 |
|---|---|---|
| GET | `/api/admin/users/stats` | D-1 |
| 欄位 | `UserDTO.department` | D-1 |
| POST | `/api/orders/{id}/confirm-receipt` | D-2 |
| CRUD | `/api/addresses...` + `POST /api/orders` 增 `addressId` | D-3 |
| 欄位 | `ExchangeRecordDTO` 擴展 | D-4 |
| 欄位 | `PointRuleDTO` 擴展 | D-5 |
| GET | `/api/orders?keyword=` | D-6 |
| 欄位 | `ProductDTO.images[]` | D-7 |

---

## 附：查證範圍
- **直接讀過程式碼**：前端 `services/api/*.ts`、`request.ts`、各頁面（含 PR #5 新增：RedemptionSuccess / OrderDetail / ProductDetailAdmin / ExchangeDetail，及 MyOrders / MyPoints / Users / ShopHome / CreateProduct / Categories 改造）、`router`、`utils/orderStatus.ts`、i18n locales；四後端 controller；gateway 路由；`API接口文档.md v1.1`。
- 設計稿真相：`awsome-shop-plan/doc/awsome-shop.pen`（30 個 Web frame；可用 Pencil CLI 導出比對）。
