# Git 使用规范

## Push 规则

- 执行 `git push` 时必须加 `--no-verify` 跳过本地 hooks：
  ```bash
  git push --no-verify
  ```

## 多人协作 - Rebase 优先

- 推送前先拉取远端最新代码并 rebase：
  ```bash
  git pull --rebase origin main
  ```
- 如果 rebase 有冲突，解决后继续：
  ```bash
  git add .
  git rebase --continue
  ```
- 禁止使用 merge 方式拉取（避免多余的 merge commit）

## 完整推送流程

```bash
git add <files>
git commit -m "描述信息"
git pull --rebase origin main
# 解决冲突（如有）
git push --no-verify
```
