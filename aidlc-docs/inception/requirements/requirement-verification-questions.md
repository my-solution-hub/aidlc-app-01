# 需求澄清问题 — demo 用户权限管理应用

请在每个问题的 `[Answer]:` 标签后填写你选择的字母选项（如 `[Answer]: A`）。如果都不匹配，请选择 "Other" 并描述。完成后请告诉我 "完成" 或 "done"。

---

## Question 1
这个 demo 权限管理应用的核心目标是什么？

A) 演示一套完整的 RBAC（基于角色的访问控制）：用户、角色、权限三层模型
B) 仅做简单的用户增删改查 + 登录认证（不涉及复杂角色权限）
C) 用户 + 角色两层（每个用户直接绑定角色，角色决定能做什么）
X) Other（请在 [Answer]: 后描述）

[Answer]:

---

## Question 2
应用形态是什么？

A) 纯后端 REST API（提供接口，无界面）
B) 后端 API + 简单的 Web 前端界面（可在浏览器中操作）
C) 全栈应用（前后端分离，含完整 UI）
X) Other（请在 [Answer]: 后描述）

[Answer]:

---

## Question 3
技术栈倾向？（考虑到这是测试 app，会优先选轻量方案）

A) Python（FastAPI + SQLite）— 轻量、启动快，适合 demo
B) Node.js / TypeScript（Express 或 NestJS）
C) Java（Spring Boot）— 与工作区现有 awsome-shop 风格一致
D) 让 AI 推荐最适合 demo 的方案
X) Other（请在 [Answer]: 后描述）

[Answer]:

---

## Question 4
认证方式如何处理？

A) JWT Token（登录后返回 token，后续请求携带）
B) 简单 Session / 用户名密码校验（最简，适合纯 demo）
C) 不需要认证，仅做权限数据的 CRUD 演示
X) Other（请在 [Answer]: 后描述）

[Answer]:

---

## Question 5
数据持久化方式？

A) SQLite / 轻量本地数据库（无需额外安装，适合 demo）
B) PostgreSQL / MySQL（需要数据库服务）
C) 内存存储（重启即丢失，最简单，纯演示用）
X) Other（请在 [Answer]: 后描述）

[Answer]:

---

## Question 6: 安全扩展（Security Baseline）
是否对本项目强制执行安全扩展规则？

A) 是 — 将所有 SECURITY 规则作为阻塞性约束强制执行（推荐用于生产级应用）
B) 否 — 跳过所有 SECURITY 规则（适合 PoC、原型和实验性项目）
X) Other（请在 [Answer]: 后描述）

[Answer]:

---

## Question 7: 属性测试扩展（Property-Based Testing）
是否对本项目强制执行属性测试（PBT）规则？

A) 是 — 强制执行所有 PBT 规则（推荐用于含业务逻辑、数据转换、序列化或有状态组件的项目）
B) 部分 — 仅对纯函数和序列化往返强制执行 PBT 规则
C) 否 — 跳过所有 PBT 规则（适合简单 CRUD 应用、纯 UI 项目或无显著业务逻辑的薄集成层）
X) Other（请在 [Answer]: 后描述）

[Answer]:

---

## Question 8: 弹性扩展（Resiliency Baseline）
是否对本项目应用弹性基线？（一组源自 AWS Well-Architected 可靠性支柱的设计期最佳实践）

A) 是 — 应用弹性基线作为方向性最佳实践（推荐用于业务关键型工作负载）
B) 否 — 跳过弹性基线（适合 PoC、原型和注重快速迭代的实验性项目）
X) Other（请在 [Answer]: 后描述）

[Answer]:
