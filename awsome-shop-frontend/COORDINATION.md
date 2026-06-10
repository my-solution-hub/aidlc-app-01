# 前端并行开发 · 协作契约（COORDINATION）

> 目的：两个前端 agent 并行开发，文件归属不重叠，避免冲突；由 **Track A（集成方）** 最终收口 + 验收。
> 基线：**PR #4（`frontend/design-alignment`）已完成全部纯前端设计稿对齐**（员工/管理端缺页 + 弹窗）。本协作针对其**之后的剩余工作**。
> 设计稿真相：`awsome-shop-plan/doc/awsome-shop.pen`（导出图见 `env/design-exports/`）。后端契约：`API接口文档.md`。后端缺口：`前端设计对齐-待后端补齐清单.md`。

---

## 0. 分支与基线
- 基线分支：`frontend/design-alignment`（PR #4）。**两条 lane 都从它开分支**（待 #4 合并后改从 `main`）。
  - Track A：`frontend/track-a-*`
  - Track B：`frontend/track-b-*`
- 每个小任务一个分支 + 小 PR，合并前先 `git pull --rebase` 基线。
- **只改 `awsome-shop-frontend/` 子目录**，不碰后端/网关/Android/plan。

## 1. 文件归属（硬边界，避免冲突）

| 区域 | 归属 | 说明 |
|---|---|---|
| `src/types/api.ts` | **A** | 所有 DTO/类型扩展由 A 统一改（B 需要新类型 → 通知 A 加） |
| `src/services/api/*` | **A** | 新增 service（userPoint/address/pointConfig 等）由 A 建 |
| `src/router/index.tsx` | **A** | 路由（含懒加载改造）由 A 改 |
| `vite.config.ts` / `tsconfig*` / 测试配置 | **A** | 工程化配置 |
| `src/**/__tests__/**`、`*.test.tsx` | **A** | 单测 |
| `src/i18n/locales/*` | **B** | 残余中文补齐 + 新文案（A 若新增 key 先在 PR 里列出交给 B 合并） |
| `src/components/*`（新建通用组件如 LazyImage） | **B** | 通用组件润色 |
| `src/pages/*`（页面体内的润色：防抖/懒加载/校验/a11y） | **B** | 页面级润色 |
| `src/pages/Register/*` | **B** | 注册校验 |

**重叠风险点**：`src/pages/*` 同时被 A（接线新功能）和 B（润色）改。规则：
- B 的润色**不改业务逻辑/接口调用**，只加防抖、懒加载、校验、aria 属性。
- A 的后端接线任务**等后端就绪后再做**，做前在本 doc「认领」对应文件，B 暂避让该文件。
- 同一文件确需双方改 → 在本 doc 末尾「文件锁」登记，谁先登记谁先改。

## 2. i18n 规则
- 中英文**必须同步**（zh.json + en.json）。
- A 若因新页面需要 key，在 PR 描述里列出 key 清单，由 B 统一并入 `locales/*`（避免两边同时改 json 冲突）。

## 3. 提交前自检（两条 lane 通用）
```bash
docker compose -f env/docker-compose.yml exec frontend npm run lint   # 不得引入新 error
docker compose -f env/docker-compose.yml exec frontend npm run build  # 必须通过
```
> 注：`AppSnackbar.tsx` 的 react-refresh error 是基线既有问题，已分配给 Track B（P-B1）修复。

## 4. Track A 收口 / 验收清单（最终由 A 执行）
- [ ] 两条 lane 的 PR 全部 rebase 到最新基线并合并，无冲突残留
- [ ] `npm run lint` 0 error（含 AppSnackbar 修复后）
- [ ] `npm run build` 通过；bundle 经懒加载后主包显著下降
- [ ] 单测 `npm run test` 全绿
- [ ] 逐页对照 `env/design-exports/*.png` 走查（webapp-testing 截图）：员工 6 页 + 管理 8 页 + 主要弹窗
- [ ] 后端依赖项：已接线的真实联通；未就绪的显示 `—`/隐藏，无假数据、无死按钮
- [ ] i18n 中英文无遗漏、无残余硬编码中文
- [ ] 合并出口 PR 到 `main`，关闭/合并 PR #4

## 5. 文件锁登记（需要时填）
| 文件 | 认领人 | 起 | 止 |
|---|---|---|---|
| （示例）src/pages/Users/index.tsx | A | 06-11 | 06-11 |

---
各自任务见 `TODO-track-A.md`（集成方/工程化+后端接线打底）、`TODO-track-B.md`（页面与组件润色）。
