# AIDLC 培训前准备清单

> 来源：[AIDLC提前准备工作-借助AI工具准备](https://quip-amazon.com/xG5SAWFbiMQb)
> 培训项目：awsome-shop（Java 微服务电商，DDD brownfield 工程）
> 核心工具链：Kiro IDE + AIDLC 工作流 + Pencil 设计稿 + MCP 扩展

勾选说明：`[ ]` 待办 · `[x]` 已完成 · `[-]` 不适用/跳过

---

## 一、核心开发工具

- [x] **Kiro IDE / CLI**（必备）— AI 辅助开发核心 IDE
  - 安装：从内部渠道获取安装包，完成登录授权
  - 验证：`kiro-cli --help` 或打开 Kiro IDE 确认正常启动
- [ ] **Kiro Web**（可选）— 设计后通过 Autonomous 编码
  - 参考：[Kiro / Amazon Q Developer 内部版 FAQ](https://quip-amazon.com/T2s3AmuD7XqH)

## 二、AIDLC Workflow

- [x] AIDLC Workflows 原始仓库（已 clone 到 `aidlc-workflows/`）：`git clone https://github.com/awslabs/aidlc-workflows.git`
- [ ] Kiro Power（AIDLC）：https://github.com/kiro-community/powers/tree/main/aidlc （按 README 配置到 Kiro）
- [ ] Kiro Skill：https://github.com/kiro-community/kiro-skills/tree/main/aidlc-workflows

## 三、运行时环境

- [x] **JDK**：⚠️ 代码实际要求 **Java 21**（pom `target=21`）。已装 OpenJDK 21.0.11 用于编译 — `brew install openjdk@21`
  - 注意：本机 PATH 默认是 JDK 25，但 25 与工程 Lombok 不兼容（`TypeTag :: UNKNOWN`），文档建议的 23 Homebrew 无 formula；故选用与代码 target 一致的 21。
  - 编译时设：`export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home`
- [x] **Maven**：3.9.x+ — `brew install maven`
  - 验证：`mvn -version`
- [x] **Node.js & npm**：Node 20 LTS+ — `brew install node`
  - 验证：`node -v`、`npm -v`
- [x] 建议提前编译前后端，确保类库预下载到本地（5 个后端 `mvn compile` 全部成功；前端 `npm install` 成功）
- [ ] **Android Studio**（可选）— 挑战生成 Android 前端时使用

## 四、数据库

- [x] **Docker Desktop** 已安装并运行 — `brew install --cask docker`
- [x] **MySQL 8.4** 容器已启动（推荐 Docker 运行）
  ```bash
  docker run -d --name mysql84 -e MYSQL_ROOT_PASSWORD=your_password -p 3306:3306 mysql:8.4
  ```
  - 验证：`mysql -h 127.0.0.1 -u root -p` 可连接

## 五、LSP（可选）

- [ ] **jdtls**（Java 语言服务）— 在 Kiro 项目根目录运行 `/code init` 自动配置

## 六、MCP Server

- [ ] **MUI MCP** — Material UI 组件库上下文（辅助前端 UI 生成）：https://mui.com/material-ui/getting-started/mcp/
- [ ] **Chrome DevTools MCP** — AI 与 Chrome 交互（调试、截图、性能分析）；前置：已安装 Chrome

## 七、设计稿与工具

- [ ] **Pencil 设计工具**（二选一，免费需注册账号）
  - 方式一：Pencil 桌面软件 https://www.pencil.dev/
  - 方式二：Kiro / VS Code 插件 https://open-vsx.org/extension/highagency/pencildev
- [x] 设计稿可打开：`awsome-shop.pen`（含员工端 Web、Android、Admin Web 端）

## 八、项目代码仓库（提前 clone，共 7 个）

> 培训从 **baseline** 分支开始，**intermediate** 分支可参考。
> 建议组内一位同学统一创建仓库、推送代码并 share（Kiro Autonomous 与 GitHub 打通）。

**前端（2 个）**
- [x] `git clone https://github.com/catface996/awsome-shop-frontend.git`（Web）
- [x] `git clone https://github.com/catface996/awsome-shop-android.git`（Android）

**后端微服务（5 个）**
- [x] `git clone https://github.com/catface996/awsome-shop-gateway-service.git`（API 网关）
- [x] `git clone https://github.com/catface996/awsome-shop-auth-service.git`（用户管理）
- [x] `git clone https://github.com/catface996/awsome-shop-product-service.git`（商品管理）
- [x] `git clone https://github.com/catface996/awsome-shop-points-service.git`（积分管理）
- [x] `git clone https://github.com/catface996/awsome-shop-order-service.git`（交易系统）

**设计稿仓库**
- [x] `git clone https://github.com/catface996/awsome-shop-plan.git`
- [x] 各仓库可正常切换 baseline / intermediate 分支

## 九、Claude Code Multi Agent Coworkers（可选）

- [x] 安装 tmux（已装 3.6a）
- [ ] 配置 Claude Code 支持 Multi Agent Coworker
  - 参考：[tmux 安装与 Claude Code Agent Teams 配置指南](https://quip-amazon.com/RRgkAqVg6Dfo)

---

## 十、环境自检清单（培训前一天完成）

**必须项**
- [x] Kiro IDE 正常启动，CLI 可用
- [x] git clone 7 个 AIDLC 相关仓库成功
- [x] `java -version` → 23.0.1+（实际 25.0.2）
- [x] `mvn -version` → 3.9.x+（3.9.16）
- [x] `node -v` → 20.x+，`npm -v` 正常（24.13.0 / 11.6.2）
- [x] Docker Desktop 已安装并运行
- [x] MySQL 8.4 容器已启动，可连接
- [ ] MUI MCP 和 Chrome DevTools MCP 已配置
- [x] 网络可访问 GitHub 和相关资源
- [ ] Pencil 桌面软件 或 Kiro/VS Code 插件已安装
- [x] 设计稿 `awsome-shop.pen` 文件已就位（打开需 Pencil）
- [x] 前端仓库已 clone
- [x] 后端 5 个微服务仓库已 clone
- [x] 设计稿仓库已 clone
- [x] 各仓库可正常切换 baseline / intermediate 分支

**可选项**
- [ ] jdtls 在 Kiro 中工作正常（推荐）

---

## 本机环境检查结果

> 检查时间：2026-06-09 · 工作目录：`/Users/xrre/Documents/Workshop/aidlc`

| 项目 | 要求 | 本机实际 | 状态 |
|---|---|---|---|
| Kiro CLI | 可用 | kiro-cli 2.4.2 | ✅ |
| Kiro IDE | 可启动 | /Applications/Kiro.app | ✅ |
| JDK | 23.0.1+ | OpenJDK 25.0.2，JAVA_HOME 已设 | ✅ |
| Maven | 3.9.x+ | 3.9.16（本次安装） | ✅ |
| Node / npm | Node 20+ | Node 24.13.0 / npm 11.6.2 | ✅ |
| Docker Desktop | 已安装运行 | Docker 29.4.0，运行中 | ✅ |
| MySQL 8.4 | 容器可连接 | 容器 `mysql84` 运行中（端口 3306，root 密码 `aidlc_root_pw`） | ✅ |
| Chrome | 已安装 | /Applications/Google Chrome.app | ✅ |
| tmux | 可选 | tmux 3.6a | ✅ |
| git | — | 2.50.1 | ✅ |
| 7+1 仓库 clone | 全部成功 | 8 个仓库全部 clone 成功 | ✅ |
| 设计稿 awsome-shop.pen | 存在可打开 | `awsome-shop-plan/doc/awsome-shop.pen`（2.4MB） | ✅ |
| 分支切换 | baseline/intermediate | 6 个后端/前端已切到 baseline；android/plan 为 main | ✅ |

**仓库分支情况**
- frontend、auth、product、points、order：含 `baseline` + `intermediate`，已切到 baseline
- gateway：仅 `baseline`（与原文档一致），已切到 baseline
- android、plan：默认 `main` 分支（设计稿/Android 资源仓库）

**待人工完成的项（无法脚本验证）**
- [ ] Kiro IDE 登录授权 + AIDLC Workflow / Power / Skill 配置到 Kiro
- [ ] Kiro 中配置 MUI MCP、Chrome DevTools MCP
- [ ] Pencil 桌面软件或 Kiro/VS Code 插件安装 + 注册账号 + 打开 .pen 设计稿
- [ ] （可选）jdtls：在 Kiro 项目根目录运行 `/code init`
- [ ] （可选）配置 Claude Code Multi Agent Coworker
- [ ] （可选，如需组内协作）将仓库推送到组内协作 GitHub 仓库并 share

**备注**
- MySQL 连接测试：容器已运行，主机未安装 mysql 客户端，可在 Kiro/应用内用 JDBC 连接 `jdbc:mysql://127.0.0.1:3306/`（root / `aidlc_root_pw`）。
- 如需停止/重启 MySQL：`docker stop mysql84` / `docker start mysql84`。
