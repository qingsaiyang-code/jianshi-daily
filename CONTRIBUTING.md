# 开发约定

每个功能都先说明问题与验收条件，再修改、验证、提交。一个提交只解决一个完整问题。

## 每次交付的记录

后续指导和 PR 描述均使用以下格式：

```text
目标：用户能做什么，原来的问题是什么。
改动文件：逐个写路径，以及这个文件为什么需要修改。
验证：给出可复制的命令和实际结果；明确没验证的部分。
提交：给出本次改动对应的 git add 与 git commit 命令。
限制：写出依赖的外部配置或尚未完成的行为。
```

## 本地检查

```powershell
npm run check
```

交互、路由、存储或响应式行为发生改变时，再执行：

```powershell
npm run test:e2e
```

测试应验证用户行为和业务边界。纯文案或小样式调整不需要增加镜像式单元测试，但要检查相关页面。CI 统一执行全部现有检查。

## 提交约定

使用 `feat:` 新功能、`fix:` 修复、`docs:` 文档、`test:` 测试、`refactor:` 重构、`chore:` 工具维护。例如：

```powershell
git add src/lib/taxonomy.ts src/components/knowledge-app.tsx tests/
git diff --cached
git commit -m "feat: add category filter"
```

初始化提交可以 `git add .`；后续优先指定实际修改的文件。依赖变化必须一起提交 `package.json` 与 `package-lock.json`。

## 内容约定

每条知识必须保留来源与适用条件。日期字段表示归档日期，不能冒充原文发布日期。新增知识检查 ID 唯一性、分类层级、来源 URL、重复内容和事实依据。未经核验的抓取结果不能直接成为已发布事实。

联网服务在后续阶段仅由 `src/server/` 与 `src/app/api/` 调用。浏览器不得持有提供商密钥，第三方文章里的文字不能当作系统指令。

PR 流程见 [Git 工作流](docs/GIT-WORKFLOW.md)。
