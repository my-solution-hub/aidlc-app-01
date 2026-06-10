# AWSomeShop 前端功能清單（已驗證版）

> 以**實際程式碼**為準（前端頁面 / service 層 + 後端 controller + gateway 路由皆查證過）。判斷標準依需求：
> - **A 類（視為完成）**：前端 UI + 呼叫程式碼已寫好，後端正常供資料即可運作。
> - **B 類（不完整）**：前端本身缺頁面/欄位/邏輯，需補（部分後端已備）。
>
> - 來源：`awsome-shop-frontend/src/`；四個後端服務 controller；gateway `application-local.yml`
> - 日期：2026-06-10

---

## ✅ 前後端契約：已對齊

前端 service 層已於 commit `1302e4c（前后端 API 全面 REST 化 + 规格对齐）`改為標準 REST，與後端一致。實測對照：

| 前端 service | 後端端點 | 一致 |
|---|---|---|
| `auth.ts` → `POST /api/auth/login` | `POST /api/auth/login` | ✅ |
| `product.ts` → `GET /api/products`、`POST/PUT/DELETE/PATCH /api/admin/products/{id}` | 同 | ✅ |
| `point.ts` → `GET /api/points/balance?userId`、`/transactions` | 同 | ✅ |
| `order.ts` → `POST /api/orders`、`GET /api/orders` | 同 | ✅ |
| `category / user / pointRule / exchangeRecord` | 對應 `/api/...` REST | ✅ |

回應包裝 `Result<T>` / `PageResult<T>` 兩邊一致。**先前文件所述「契約不一致」已不成立**，那是早期 RPC 版的舊狀態。

> 小提醒（非契約問題）：`request.ts` baseURL 預設 `http://localhost:8088`，gateway 實際 `8080`，部署時用 `VITE_API_BASE_URL` 對齊即可。

---

## A. 前端已完整（後端供資料即可用）

| 功能 | 頁面 | 對應後端 |
|---|---|---|
| 登入 / 登出 / 角色守衛 | Login / AuthGuard | `/api/auth/login`、`/logout` |
| 商品列表 + 搜尋 | ShopHome（主體） | `GET /api/products` |
| 商品詳情頁 | ProductDetail | `GET /api/products/{id}` |
| 兌換確認頁（含兌換後餘額、餘額不足禁用） | ConfirmRedemption | `/api/products/{id}`、`/api/points/balance`、`POST /api/orders` |
| 我的訂單列表 | MyOrders | `GET /api/orders` |
| 我的積分（餘額 + 明細） | MyPoints | `/api/points/balance`、`/api/points/transactions` |
| 管理-商品管理（列表/新增/編輯/刪除） | Products | `/api/products`、`/api/admin/products/**` |
| 管理-分類管理 | Categories | `/api/categories/tree`、`/api/admin/categories/**` |
| 管理-兌換記錄管理（統計/篩選/詳情/匯出） | ExchangeRecords | `/api/admin/orders/**` |
| 管理-使用者管理 | Users | `/api/admin/users/**` |
| 儀表板 | Dashboard | 組合多個既有 API |
| 註冊（基本） | Register | `POST /api/auth/register` |

---

## B. 不完整（需補前端，括號內為後端狀態）

### B-1 功能性缺口

| # | 功能 | 缺什麼（前端） | 後端狀態 |
|---|---|---|---|
| 1 | 積分管理三件套（US-020/021/022） | 前端做成「積分規則 CRUD（PointRules）」，非需求要的「員工積分列表 / 手動調整 / 發放配置」→ 需重做頁面 | ✅ 已有 `/api/admin/users`、`/api/points/balance`、`/api/internal/points/adjust`、`/api/admin/points/config`、`/api/internal/points/distribute` |
| 2 | 圖片上傳 UI（BR 6.2） | 商品表單無上傳元件 | ✅ 已有 `POST /api/files/upload` |
| 3 | 註冊工號 `employeeId`（US-001） | 註冊表單缺工號欄位 | ⚠️ 後端 user 模型支援工號（唯一校驗 `AUTH_007`）；public `RegisterRequest` 是否開放此欄位待確認 |
| 4 | 分類串接 API（US-004） | ShopHome / CreateProduct 仍硬編碼 `CATEGORIES`；無二級分類/麵包屑 | ✅ 已有 `GET /api/categories/tree`（樹形） → 只要補前端 |
| 5 | 員工端分頁 / 無限滾動（US-004/007/009/012） | 商品/訂單/積分歷史寫死 `size:50` | ✅ 後端 list 支援分頁 → 只要補前端 |
| 6 | 兌換歷史詳情入口（US-012） | MyOrders 無法點進詳情 | ✅ 已有 `GET /api/orders/{id}` |

### B-2 體驗 / NFR 小項（純前端）

| # | 功能 | 缺什麼 |
|---|---|---|
| 7 | API 超時（NFR-FE-014） | `request.ts` 為 15s，需求 10s |
| 8 | 積分類型中文映射（US-009） | MyPoints `txn.type` 顯示英文枚舉，未做 EARN/SPEND/ADJUST/REFUND → 中文 |
| 9 | 商品表單「庫存」輸入（US-013） | CreateProduct 缺 `stock` 輸入欄位（API 已支援 `stock`） |
| 10 | 圖片懶加載（NFR-FE-020） | 商品圖直接 `<img>`，未加 `loading="lazy"` |
| 11 | 註冊前端校驗（US-001） | 無帳號長度（3–20）/密碼長度校驗 |

---

## C. 規格 / 待決事項（非單純漏做）

| 項目 | 說明 |
|---|---|
| 密碼長度 | US-001 寫 ≥8、business-rules 寫 ≥6，需收斂後再做前端校驗 |
| 兌換狀態枚舉 | 前端 `PENDING_DELIVERY/...` 與計畫 `PENDING/READY/...` 需對齊（含後端實際枚舉） |
| 工號開放範圍 | 確認 public 註冊是否開放 `employeeId`，或工號僅由管理員建立 |
| 可訪問性 WCAG 2.1 AA | 需手動 + 輔助技術驗證 |

---

## 附：查證範圍

- **直接讀過程式碼**：前端 `services/api/*.ts`、`request.ts`、ShopHome、ProductDetail、ConfirmRedemption、MyPoints、Register、Products/CreateProduct、router、useAuthStore、i18n locales；四個後端服務 controller；gateway `application-local.yml`。
- **沿用差距分析（未逐行重看）**：MyOrders、Dashboard、Categories、ExchangeRecords、Users、Products 列表頁的內部細節。

*前後端端點完整對照另見 `Olivia-AWSomeShop-後端API缺口與規格.md`（註：該檔目前仍含「契約不一致」的舊框架，需同步更正——契約其實已於 `1302e4c` 對齊）。*
