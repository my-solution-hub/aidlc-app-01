# AWSomeShop 前端 vs 设计稿(.pen) 符合度验证清单

> 比对来源：`awsome-shop-plan/doc/awsome-shop.pen`（Web 1440 套设计） ↔ `awsome-shop-frontend/src`
> 说明：`.pen` 同时含 Web(1440) 与 Android(390) 两套设计。本清单仅验证 **Web 前端**（`awsome-shop-frontend`）。Android 设计对应 `awsome-shop-android`，不在本次范围。
> 图例：✅ 符合　⚠️ 部分符合　❌ 缺失
> 勾选框供 PM/确认人逐项 review：`[ ]` 未确认 → `[x]` 已确认

---

## 一、总体结论

- [ ] **管理端（Admin）：高度符合** — 11 个页面 + 10 个对话框基本全部实作到位
- [ ] **员工端（Employee）：主流程通，但商品/兑换细节与「收货地址」落差较大**
- [ ] 已知 2 个设计画面在前端完全无对应页面：`Employee - Delivery Info`、`Admin - User Points History`；另 `Admin - Team` 疑似 stub

---

## 二、员工端（Employee）逐画面比对

| 确认 | 设计画面 | 前端页面 | 结果 | 主要落差 |
|---|---|---|---|---|
| [ ] | Employee - Login | Login | ✅ 符合 | 品牌面板、帐密、显示密码、注册链接、依角色跳转 |
| [ ] | Employee - Shop Home | ShopHome | ⚠️ 大致符合 | 缺：商品**评分**(4.5(128))、促销**标签**(热销/新品/特惠)。搜索/分类筛选/积分价/兑换钮已有 |
| [ ] | Employee - Product Detail | ProductDetail | ❌ 落差大 | 缺：**规格参数表**、**颜色选择**、**数量加减器**、**市场参考价**、**新人首兑优惠**、**配送信息**、**服务保障**、**加入心愿单**、**同类推荐** |
| [ ] | Employee - Confirm Redemption | ConfirmRedemption | ⚠️ 部分符合 | 缺：**数量选择**(写死=1)、**新人首兑折扣行**、**收货信息区块**、**温馨提示** |
| [ ] | Employee - Delivery Info | （无） | ❌ 缺失 | **整页未实作**：无收货地址簿、无新增地址表单；兑换流程不收集收货地址 |
| [ ] | Employee - Redemption Success | RedemptionSuccess | ✅ 符合 | 订单号/扣除积分/剩余/预计送达/三个按钮齐全 |
| [ ] | Employee - Order Detail | OrderDetail | ⚠️ 部分符合 | 缺：**积分明细折扣行**、**收货信息**(仅收件人名，无电话/地址)、**「确认收货」按钮** |
| [ ] | Employee - Redemption History | MyOrders | ⚠️ 部分符合 | 缺：**「确认收货」「再次兑换」**操作钮(仅「查看详情」)。搜索/状态页签/分页/物流单号已有 |
| [ ] | Employee - Points Center | MyPoints | ✅ 符合 | 可用积分卡、累计获得/使用/兑换次数、快捷入口、积分获取途径、明细收入/支出筛选 |

> 跨页缺口：**「确认收货」整条链路前端无入口**（设计在订单列表与订单详情都有此按钮）。

---

## 三、管理端（Admin）逐画面比对

| 确认 | 设计画面 | 前端页面 | 结果 | 主要落差 |
|---|---|---|---|---|
| [ ] | Admin - Dashboard | Dashboard | ✅ 符合 | 4 指标卡 + 最近兑换表。指标「本月新增/环比」增量为静态标签(待后端) |
| [ ] | Admin - Product Management | Products | ✅ 符合 | 搜索/分类筛选/卡片/上下架/编辑删除/分页 |
| [ ] | Admin - Product Detail | ProductDetailAdmin | ✅ 符合 | 含规格/配送/服务/促销/颜色，三个对话框齐全 |
| [ ] | Admin - Edit Product | CreateProduct | ✅ 符合 | 基本信息/图片上传/描述/规格动态增删 |
| [ ] | Dialog - 下架确认 | OffShelfDialog | ✅ 符合 | |
| [ ] | Dialog - 调整库存 | StockDialog | ✅ 符合 | 入库/出库 + 调整后预览 |
| [ ] | Dialog - 上传图片 | UploadDialog | ✅ 符合 | 拖拽/格式大小校验/预览 |
| [ ] | Admin - Category Management | Categories | ✅ 符合 | 树状/展开/新增子类/启用禁用/分页 |
| [ ] | Dialog - 新增类目 | CategoryDialog | ✅ 符合 | |
| [ ] | Dialog - 编辑类目 | CategoryDialog | ✅ 符合 | |
| [ ] | Dialog - 删除类目确认 | DeleteCategoryDialog | ✅ 符合 | 输入名称强确认 |
| [ ] | Admin - Points Rule Management | PointRules | ✅ 符合 | 统计卡 + 规则表 + 增改对话框。「本月发放/覆盖员工」显示「—」(待后端) |
| [ ] | Dialog - 新增规则 | PointRuleDialog | ✅ 符合 | |
| [ ] | Dialog - 编辑规则 | PointRuleDialog | ✅ 符合 | |
| [ ] | Admin - Exchange Records | ExchangeRecords | ✅ 符合 | 统计卡/搜索/状态+日期筛选/表格/导出/分页 |
| [ ] | Admin - Exchange Detail | ExchangeDetail | ✅ 符合 | 商品/积分明细/员工/订单信息 + 取消/打印/改发货状态 |
| [ ] | Dialog - 修改发货状态 | ShippingDialog | ✅ 符合 | 目标状态 + 物流公司/单号 |
| [ ] | Admin - User Management | Users | ✅ 符合 | 统计卡/搜索/角色筛选/增改/启用禁用/导出。部门/余额/兑换次数列显示「—」(待后端) |
| [ ] | Dialog - 调整用户积分 | AdjustDialog (UserPoints) | ✅ 符合 | 增/减、原因、防负额 |
| [ ] | Admin - 发放配置 | ConfigDialog (UserPoints) | ✅ 符合 | 额度/发放日/开关 |
| [ ] | Admin - User Points History | （无） | ❌ 缺失 | **整页未实作**：缺「某员工积分变动记录」明细页；列表无「查看记录」入口 |
| [ ] | Admin - Team | （无） | ⚠️ 缺失/疑似不在范围 | 设计仅空壳(团队成员/添加成员)，研判为占位画面 |

> 导览列差异（非问题）：设计侧栏 6 项，前端把「积分管理」拆成 **积分规则** + **积分管理(用户积分)** 共 7 项，属合理增强。

---

## 四、待补功能清单（按优先级）

> ⚠️ 修正说明：经核对仓库既有需求基线（`aidlc-docs/construction/设计稿功能差异分析.md`），原列为 P0 的「收货地址」与「确认收货」实为 **MVP 明确排除**（`FR-ORDER-005` 线下自取模式，Scope Out 物流配送），后端**无对应端点/领域**，需改商业模式并新增后端，实际应归 **P2/V2**。仅「员工积分变动记录」后端已支援、可纯前端落地。

### 已完成
- [x] 3. `Admin - User Points History` 员工积分变动记录明细页（US-020 明细）
  - 新增页面 `pages/UserPoints/History.tsx`，路由 `/admin/user-points/:userId`
  - 员工积分列表新增「查看记录」入口，并抽出共用 `AdjustDialog`（列表与明细页共用）
  - 数据来源：`GET /point/api/points/transactions?userId=`（后端已支援）

### 待产品决策（原列 P0，实为 P2 / V2，需后端 + 商业模式变更）
- [ ] 1. `Employee - Delivery Info` 收货地址簿 + 兑换带地址
  - 阻塞：后端无 Address 领域、无地址簿端点；`ExchangeRequest` 无地址字段；MVP 为线下自取
- [ ] 2. 员工端「确认收货」入口（订单列表 + 订单详情）
  - 阻塞：后端仅有 `PUT /admin/orders/{id}/status`（管理员）；无员工确认收货端点；MVP 为线下自取

### P1 — 商品体验对齐设计（纯前端可做，部分字段后端已具备）
- [ ] 4. Product Detail 补：规格参数表、颜色选择、数量加减、市场参考价、促销/服务/配送信息
- [ ] 5. Confirm Redemption 补：数量选择、优惠折扣行、温馨提示

### P2 — 视觉细节
- [ ] 6. ShopHome 商品评分与促销标签
- [ ] 7. Dashboard / PointRules / Users 的统计增量数字（多数标注「待后端」）

---

## 五、确认与签核

- [ ] 以上比对结果已 review，认可分类与结论
- [ ] P0 待补项已排入计划
- [ ] P1 / P2 待补项已排入计划或确认延后

> 确认人：____________　日期：____________


---

## 六、MVP 用户故事覆盖（25 条：21 Must + 4 Should）

> 依据：`awsome-shop-plan/aidlc-docs/inception/user-stories/stories.md` 与 `application-design/unit-of-work-story-map.md`
> 结论：**前端 25 条全部有对应实作**。本次 #3 补齐了 US-020 AC4 唯一缺的 MVP 验收点。

| 确认 | 旅程 | 故事 | 优先级 | 前端实作 | 状态 |
|---|---|---|---|---|---|
| [ ] | 注册/认证 | US-001 注册(含工号) | Must | Register | ✅ |
| [ ] | 注册/认证 | US-002 登录 | Must | Login | ✅ |
| [ ] | 注册/认证 | US-003 退出 | Must | AvatarMenu 登出 | ✅ |
| [ ] | 浏览搜索 | US-004 分类浏览 | Must | ShopHome 分类 chips | ✅ |
| [ ] | 浏览搜索 | US-005 搜索 | Must | 顶栏搜索 | ✅ |
| [ ] | 浏览搜索 | US-006 产品详情 | Must | ProductDetail | ✅ |
| [ ] | 浏览搜索 | US-007 列表展示 | Must | ShopHome 卡片 | ✅ |
| [ ] | 积分查看 | US-008 积分余额 | Must | 顶栏积分 / MyPoints | ✅ |
| [ ] | 积分查看 | US-009 积分变动历史 | Must | MyPoints 明细 | ✅ |
| [ ] | 兑换 | US-010 发起兑换 | Must | ConfirmRedemption | ✅ |
| [ ] | 兑换 | US-011 兑换确认 | Must | ConfirmRedemption | ✅ |
| [ ] | 兑换 | US-012 兑换历史 | Must | MyOrders / OrderDetail | ✅ |
| [ ] | 产品管理 | US-013 添加产品 | Must | CreateProduct | ✅ |
| [ ] | 产品管理 | US-014 编辑产品 | Must | CreateProduct(edit) | ✅ |
| [ ] | 产品管理 | US-015 删除产品 | Should | Products 删除确认 | ✅ |
| [ ] | 产品管理 | US-016 产品列表(管理) | Must | Products | ✅ |
| [ ] | 分类管理 | US-017 添加分类 | Must | Categories | ✅ |
| [ ] | 分类管理 | US-018 编辑分类 | Should | Categories | ✅ |
| [ ] | 分类管理 | US-019 删除分类 | Should | Categories(强确认) | ✅ |
| [ ] | 积分管理 | US-020 员工积分列表(+明细) | Must | UserPoints + History(本次#3) | ✅ |
| [ ] | 积分管理 | US-021 手动调整 | Must | AdjustDialog | ✅ |
| [ ] | 积分管理 | US-022 发放配置 | Must | ConfigDialog | ✅ |
| [ ] | 兑换记录 | US-023 查看全部 | Must | ExchangeRecords | ✅ |
| [ ] | 兑换记录 | US-024 更新状态 | Should | ExchangeDetail ShippingDialog | ✅ |
| [ ] | 管理员权限 | US-025 登录+权限 | Must | AuthGuard / AdminLayout | ✅ |

### AC 层级小偏差（非整条缺失，建议确认）
- [ ] US-001 AC3：密码最短设计要求 8 位，前端实作为 6 位
- [ ] US-006 AC5：商品详情页未同时显示「当前积分余额」对比（兑换确认页已有）
- [ ] US-003 AC4/5：服务端 token 失效（黑名单）为后端缺口，前端登出本身正常

---

## 七、额外功能盘点（超出 MVP 25 条）

### 已实作的额外功能（前端有、MVP 未要求）
- [ ] 1. 管理仪表盘 Dashboard（无对应 user story；4 指标卡 + 最近兑换）
- [ ] 2. 用户管理 Users（创建/编辑/启用禁用 + CSV 导出；MVP 仅 US-025 登录权限，无用户 CRUD）
- [ ] 3. 积分规则管理 PointRules（多类型规则 CRUD；MVP US-022 仅需「额度+周期」配置）—— **相对需求的过度建设项**
- [ ] 4. 多语言切换（中/英 i18n）
- [ ] 5. 明暗主题切换
- [ ] 6. 商品管理增强（SKU/品牌/市场价/规格/促销/服务/颜色、上下架、入库出库调整、图片上传对话框）
- [ ] 7. 兑换记录增强（统计卡、日期范围筛选、CSV 导出、打印详情）
- [ ] 8. 订单状态时间线（OrderDetail）
- [ ] 9. 积分中心增强（积分获取途径展示卡、快捷入口）
- [ ] 10. 商城无限滚动加载

### 设计稿有、属额外且未实作（多为 V2 / MVP 排除）
- [ ] A. `Admin - Team` 团队管理（空壳设计）
- [ ] B. 收货地址 / 确认收货 / 物流追踪（即本清单 P0 修正后的 #1/#2，MVP 明确排除）
- [ ] C. 商品评分、心愿单、同类推荐

---

## 八、总结确认
- [ ] MVP 前端 25 条功能已全部具备（实际运行依赖后端启动）
- [ ] 已知额外功能清单已 review
- [ ] 「积分规则管理」的过度建设是否保留 / 调整，已做决策
