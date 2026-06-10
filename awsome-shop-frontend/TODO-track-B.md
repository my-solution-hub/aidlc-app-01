# TODO · Track B（页面与组件润色 / NFR，全部不依赖后端）

> 负责人：B（另一 agent）。归属文件：`src/components/*`（新通用组件）、`src/pages/*`（仅润色，不动接口调用）、`src/i18n/locales/*`、`src/pages/Register/*`。
> 规则见 `COORDINATION.md`：润色**不改业务逻辑/接口调用**；改 `pages/*` 前确认该文件未被 A 在「文件锁」认领。勾选即完成。

## P-B1 修复基线 lint error（优先，解除 lint 噪音）
- [ ] 把 `components/AppSnackbar.tsx` 的 `useSnackbar` hook 抽到独立文件（如 `components/useSnackbar.ts`），组件文件只导出组件；全仓更新 import
- [ ] `npm run lint` 该 error 消失

## P-B2 图片懒加载 + 失败兜底（NFR-FE-020/021）
- [ ] 新建 `components/LazyImage.tsx`（IntersectionObserver 懒加载 + onError 占位 Icon）
- [ ] 替换各页 `<Box component="img">`：ShopHome / ProductDetail / MyOrders / OrderDetail / Products 卡片 / ProductDetailAdmin / ExchangeDetail

## P-B3 搜索防抖 300ms
- [ ] ShopHome / MyOrders / Users / Products / Categories / ExchangeRecords 搜索框加 300ms debounce（自定义 `useDebounce` 或 lodash.debounce）

## P-B4 注册表单校验（US-001 / BR 1.3）
- [ ] `pages/Register`：用户名 3-20 位、密码长度校验、即时错误提示；工号字段占位（后端就绪由 A 接，B 先放 UI + 校验）

## P-B5 残余中文 → i18n
- [ ] 全 `src/` 扫描硬编码中文（如 ShopHome 早期分类、Dashboard 部分、各页"共 X 件/条"等），补 `zh.json`/`en.json` 同步
- [ ] 注：A 新增页面若有未抽 key 的中文，A 会在其 PR 列出，B 统一并入

## P-B6 无障碍（a11y）走查
- [ ] 按 web-design-guidelines：图标按钮加 aria-label、对话框 focus 管理、对比度、表单 label 关联
- [ ] 重点：AvatarMenu / 各弹窗 / IconButton 操作列

## P-B7（可选）卡片视觉细节
- [ ] ShopHome 商品卡角标（热销/新品/特惠）——**仅当有数据来源**（如 soldCount 阈值派生且产品确认）；否则跳过并记此处需产品决策，不造假
