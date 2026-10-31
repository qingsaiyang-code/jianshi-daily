# GitHub Actions 与 Vercel

首版使用 Next.js + Vercel 托管，不需要自建服务器。非商业个人项目可从 Hobby 计划起步；有资源配额限制，商业用途应按届时条款选择计划。[Vercel Hobby 官方说明](https://vercel.com/docs/plans/hobby)。

## 1. CI 做什么

`.github/workflows/ci.yml` 在向 main 推送或向 main 提交 PR 时运行：

1. 安装 Node.js 24，使用 `npm ci` 重现锁定依赖。
2. ESLint、TypeScript、知识结构与业务单元测试。
3. Next.js 生产构建。
4. 安装 Chromium，运行 Playwright 测试；失败时保留截图、trace 与报告。

Workflow 只需要仓库只读权限，不需要 GitHub PAT、AI Key 或 Vercel token。PR 检查名为 `quality-gate`。

## 2. 接入 Vercel

仓库根目录的 `vercel.json` 已将框架和构建命令纳入版本控制：

| 配置 | 值 | 作用 |
| --- | --- | --- |
| `framework` | `nextjs` | 按 Next.js 构建和运行 |
| `installCommand` | `npm ci` | 严格按锁定文件安装依赖 |
| `buildCommand` | `npm run build` | 使用项目统一构建命令 |

Node.js 版本由 `package.json` 中的 `engines.node: 24.x` 固定；`vercel.json` 保留 Next.js 的默认输出目录。后续修改这些设置也走 PR，避免只有控制台里存在配置。[Vercel 配置说明](https://vercel.com/docs/project-configuration/vercel-json)。

你需要登录自己的 Vercel 账号，并授权读取这个 GitHub 仓库：

1. 打开 [Vercel New Project](https://vercel.com/new)，使用自己的 GitHub 账号登录。
2. Import `qingsaiyang-code/jianshi-daily`。仓库暂未创建或未授权时不会出现在列表中。
3. Framework Preset 使用 Next.js；Root Directory 使用仓库根目录 `./`。
4. Node.js 选择 24.x；Install Command 为 `npm ci`，Build Command 为 `npm run build`。
5. 不手动填写 Output Directory，不配置 API 密钥，点击 Deploy。
6. 等待部署状态为 Ready，打开返回的网址，在手机和桌面验证。

不要把整个旧交接包或 `site/` 作为 Vercel 根目录，新仓库内容从 `jianshi-daily/` 内部开始。

此处仅提供配置，尚未连接你的 Vercel 账号，也未生成部署网址。原 Sites 地址不会因此被更新或替换。

如果由助手继续操作，可安装并连接 Vercel 插件，再由助手核对账户、团队和已有项目后部署。插件连接与 Vercel 对 GitHub 仓库的访问授权是两个独立环节；若仓库访问未授权，仍需维护者在自己的账号中完成。

## 3. 首次上线验收

部署返回网址并且状态为 Ready 后，再检查：

- 首页正常加载，归档和分类可切换，搜索“光年”能够找到历史卡片。
- 收藏后刷新仍保留；隐藏卡片后可恢复。
- 在部署域名上复制分享链接，打开链接能直接读到对应知识；海报中的链接也使用部署域名。
- 手机浏览时没有水平溢出。
- 联网问答仍明确显示未接入，不能把 HTTP 503 当作部署故障。
- Vercel 的 Git 设置连接 `qingsaiyang-code/jianshi-daily`，生产分支为 `main`。

线上域名与 localhost 的浏览器存储彼此隔离，本机收藏不会自动出现在新网址。记录真实部署域名、对应提交和验收结果，再开始下一项功能。

## 4. 持续部署与质量门禁

Vercel 的 Git 集成会对分支推送建立预览，对生产分支 main 的提交建立生产部署。[官方 Git 部署说明](https://vercel.com/docs/git)。

**GitHub CI 与 Vercel 部署默认并行；单独加一个 CI 文件，不会让 Vercel 自动等它成功。** 本项目通过“保护 main → PR 必须通过 quality-gate → 合并后才进入生产分支”建立发布门禁。首次初始化 main 的推送是引导步骤，在 CI 通过之后才导入 Vercel。

必须在 GitHub 配置 [main 分支保护](GIT-WORKFLOW.md)，并让规则对维护者也生效。这样后续流程就是：

```text
功能分支 → PR → CI + Vercel 预览 → 自己验收 → 合并 main → Vercel 生产部署
```

Vercel 生产构建也可能单独失败，合并后仍需检查 Ready 状态。CI 通过并不等于发布成功。不要同时添加第二套基于 Vercel token 的 Actions 部署，否则可能重复部署。

## 5. 后续密钥与费用

后续联网问答、AI 提炼通常需要提供商账户与预算。密钥配置在 Vercel 的 Environment Variables，本地放 `.env.local`，通过服务端读取。不得使用 `NEXT_PUBLIC_` 前缀，不提交真实值。`.env.example` 仅保留变量名称与说明。

数据库和内容采集都将在后续功能中单独设计。目前 JSON 跟随构建发布，线上函数不能通过写本地 JSON 达成永久更新；新的已审核 JSON 需通过 Git 提交和构建部署发布。
