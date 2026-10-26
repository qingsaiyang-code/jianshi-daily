# 一次完整的功能开发

初始化时只提交一次 main；之后每个功能走分支和 PR。

## 开始前

```powershell
git switch main
git pull --ff-only
git status --short
git switch -c feat/your-feature
```

如果有未提交工作，先检查并保存，不要重置或清理。分支名称换成具体任务，例如 `feat/rss-ingestion`。

## 写代码并验证

```powershell
git diff
npm run check
# 交互有变化时执行
npm run test:e2e
```

## 提交与推送

```powershell
git add src/ tests/
git diff --cached
git diff --cached --check
git commit -m "feat: describe the actual change"
git push -u origin HEAD
gh pr create --base main --fill
```

把暂存路径和提交说明改成对应的实际文件和功能。CI 在 PR 中自动运行，Vercel 接入后会单独提供预览链接。打开预览，验证桌面、手机和真实操作；CI 与预览都完成后，在 GitHub 选择 **Squash and merge**，把一个功能整理成一个 main 提交。

```powershell
git switch main
git pull --ff-only
```

合并触发生产部署。不要把“push 成功”“CI 通过”和“网站部署成功”当成同一件事，分别检查对应结果。

## 配置 main 保护

首次 CI 跑完后，在仓库 Settings → Branches 或 Rules → Rulesets 为 `main` 设置：要求 PR、要求 `quality-gate` 检查通过、禁止 force push 和删除、规则对维护者也生效。单人项目不必要求另一个人的批准，但仍保留 PR 和检查记录。

GitHub Free 的公开仓库支持分支保护；实际入口以仓库界面为准。[官方说明](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)。

## 已发布功能需要回退

已推送的历史使用 `git revert` 生成反向提交，走相同 PR 流程。不要 `reset --hard` 后 force push。Vercel 的回滚只改变部署状态，回滚后仍应提交对应的代码修复，避免下一次部署重新带入问题。
