# GitHub Actions 与 Netlify

当前部署目标为 Netlify。使用现有 Next.js 项目和 GitHub 仓库，通过 Git 触发构建，不需要自建服务器。原 Vercel 方案因账号验证未完成而停止；原 Sites 网站和 Netlify 账号中的其他项目各自保留。

## 1. CI 与仓库配置

`.github/workflows/ci.yml` 在 main 推送和指向 main 的 PR 中运行 Node 24、`npm ci`、ESLint、TypeScript、单元测试、生产构建和 Playwright。检查名为 `quality-gate`，main 已要求它通过。

`netlify.toml` 管理部署设置：

| 设置 | 值 |
| --- | --- |
| Base directory | 仓库根目录，界面中留空 |
| Build command | `npm ci && npm run build` |
| Publish directory | `.next` |
| Node.js | `24` |
| 生产分支 | 在 Netlify 中选择 `main` |

Netlify 识别 Next.js 后自动安装平台适配器，并把 Route Handlers 部署为函数。保留现有 Next.js 配置和服务端 API，不改成纯静态导出，也不添加 SPA 通配重定向。[Next.js 官方适配说明](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)。

Netlify 默认会先执行一次 `npm install`。本项目在构建命令中显式执行 `npm ci`，用锁定文件重新安装后再构建；这会增加一点安装时间，用来确保最终应用依赖与 CI 一致。Node 版本由 `netlify.toml`、`.nvmrc` 和 `package.json` 对齐为 24。

## 2. 网页导入 GitHub 仓库

1. 登录 [Netlify](https://app.netlify.com/)，使用已有账号和团队。
2. 点 **Add new project → Import an existing project → GitHub**。
3. 授权 Netlify 访问 `qingsaiyang-code/jianshi-daily`；授权只需覆盖该仓库。
4. 选择 `jianshi-daily`，生产分支为 `main`。先让本次配置 PR 通过检查并由维护者审阅合并，再执行首次发布。
5. 核对上表设置。GitHub 仓库根目录就是应用根目录，不能填旧项目的 `site/` 或本机 `jianshi-daily/` 路径。
6. Project name 建议 `jianshi-daily`；若名称被占用，采用平台提供的可用名称。首版无需环境变量或 API 密钥。
7. 点击部署，观察构建日志；确认 Next.js 适配完成，构建与部署均成功，再打开平台返回的网址。
8. 若界面把“构建完成”和“公开发布”分为两步，在需要对外访问时再选择 Publish，并用未登录浏览器确认网址能打开。新额度方案的项目可能默认私有，见官方价格页。

这里使用 Git 导入，让 Netlify 负责 Next.js 构建和服务端函数；拖拽上传更适合已构建的静态文件。账号中已有的其他项目各自保留。

浏览器中登录成功不等于助手取得 API 权限。当前可由维护者在网页完成导入，助手核对配置和公开部署结果；需要 CLI 操作时再单独授权，不把 token 写入仓库。

## 3. 免费额度

截至 2026-11-02，Netlify 公布的新 Free 额度方案为 300 credits/月，生产发布每次 15 credits，流量、请求与函数运行也计入额度；预览和分支构建不按生产发布次数收费。免费额度用完后项目可能暂停。[官方价格页](https://www.netlify.com/pricing/)。

现有账号可能使用旧计费方案，应在 **Usage & billing** 查看当前套餐和余量，以账号界面为准。此次迁移仅准备配置与导入项目，不要求升级套餐或开启自动充值。频繁合并生产分支也可能消耗发布额度，后续每天更新知识时应单独评估内容存储方案。

## 4. 首次上线验收

- 首页和图标能加载，手机上无水平溢出。
- 搜索“光年”能找到历史归档，分类与日期筛选可组合使用。
- 收藏后刷新仍保留；隐藏卡片后可恢复。
- 在部署域名复制分享链接，重新打开能直接读到对应卡片；海报也使用该域名。
- `POST /api/search` 返回预期的 HTTP 503 和 `SEARCH_NOT_CONFIGURED`，说明服务端路由存在；联网问答尚未接入。
- Netlify 的 Git 连接指向本仓库，生产分支为 main，后续 PR 有 Deploy Preview。

localhost 与部署域名的浏览器存储独立，本机收藏不会自动迁入新网址。记录真实网址、发布提交、适配器版本和验收结果；CI 通过本身不能证明网站已经上线。

## 5. 持续部署与质量门禁

GitHub Actions 与 Netlify 默认可同时运行。发布门禁由受保护的 main 提供：功能分支先走 PR，`quality-gate` 成功并验收预览后才能合并；Netlify 以 main 作为生产分支。

```text
功能分支 → PR → CI + Netlify Deploy Preview → 维护者验收 → 合并 main → 生产构建与发布
```

首次导入时先核对 main 已通过检查。后续仍要检查 Netlify 的实际部署结果；首次验收后可用一次正常的文案或样式 PR，验证“推送有预览、合并后生产更新”的整条链路。

## 6. 密钥与持久数据

后续联网问答和 AI 提炼的密钥放在 Netlify 项目的 Environment variables，本地放 `.env.local`。服务端密钥不使用 `NEXT_PUBLIC_` 前缀；`.env.example` 只保留说明。

当前 JSON 随构建发布，函数运行时写入本地 JSON 不会成为永久知识库。自动采集、AI 提炼、定时任务与云端个人数据将在后续版本单独实现。
