# TODO · Track A（集成方 / 工程化 + 后端接线 + 收口）

> 负责人：A（本 agent）。归属文件：`types/api.ts`、`services/api/*`、`router`、`vite.config`、测试、收口验收。
> 规则见 `COORDINATION.md`。勾选即完成。

## 阶段一：工程化（不依赖后端，立即可做）
- [ ] A1 路由懒加载：`router/index.tsx` 用 `React.lazy` + `Suspense` 拆分页面，降低 862KB 主包
- [ ] A2 vite `manualChunks`：把 MUI / react 等拆 vendor chunk
- [ ] A3 测试框架：装 vitest + @testing-library/react + jsdom，加 `npm run test`
- [ ] A4 单测：`utils/orderStatus.ts`（nextStatuses/statusStyle）、`services/request` 拦截器解包、RedemptionSuccess 重定向逻辑
- [ ] A5 service/类型打底（提前建好，后端就绪即接）：
  - [ ] `services/api/userPoint.ts`（list/detail/adjust）+ 类型 `UserPointDTO/AdjustPointRequest`
  - [ ] `services/api/address.ts`（CRUD/default）+ 类型 `AddressDTO`
  - [ ] `pointConfig` stats、`UserDTO.department`、`ExchangeRecordDTO` 扩展字段类型
  - 注：仅建 service + 类型，不渲染；页面接线在阶段二

## 阶段二：后端接线（**阻塞**：等后端交付 `前端设计对齐-待后端补齐清单.md` 的端点）
> 开工前在 COORDINATION.md「文件锁」登记对应页面文件，B 避让。
- [ ] A6 adm-10 用户积分历史页 `/admin/users/:id/points`（新页）— 依赖 #1/#2
- [ ] A7 dlg-10 调整用户积分（Users 行操作）— 依赖 #3
- [ ] A8 Users 部门/积分余额/兑换次数真实列 + 统计卡 活跃/本月新增 — 依赖 #4/#4字段
- [ ] A9 emp-05 收货地址页 + 下单带地址 + 兑换流程插回地址步 — 依赖 #6
- [ ] A10 emp-07/08 确认收货按钮接线 — 依赖 #5
- [ ] A11 adm-09 兑换详情扩展字段 + dlg-09 快递公司/备注/状态时间线 — 依赖 #7
- [ ] A12 adm-07 统计卡真实数据；dlg-07/08 规则扩展字段；emp-08 服务端搜索；商品多图廊 — 依赖 #8/#9/#10/#11

## 阶段三：收口 / 验收
- [ ] A13 合并 Track B 全部 PR，rebase 基线，解决冲突
- [ ] A14 执行 COORDINATION.md「收口/验收清单」全项
- [ ] A15 出口 PR → main
