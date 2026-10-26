# v0.1 首次交付记录

日期：2026-10-26（北京时间）。目标是可运行、可测试、可审查、适合 GitHub + Vercel 的前端 MVP。

## 文件与用途

| 文件 | 为什么新增 |
| --- | --- |
| `package.json`、`package-lock.json` | 运行命令、精确依赖与完整锁定树 |
| `.nvmrc`、`.npmrc` | Node 24、官方 registry、精确保存版本 |
| `tsconfig.json`、`next-env.d.ts` | TypeScript 与框架类型配置 |
| `next.config.ts`、`eslint.config.mjs` | Next.js 与静态检查配置 |
| `.gitignore`、`.gitattributes`、`.editorconfig` | 排除产物和密钥，统一换行及编辑规范 |
| `.env.example` | 不含秘密的环境变量说明 |
| `src/app/layout.tsx`、`src/app/page.tsx` | 中文元信息、服务端取数与首页入口 |
| `src/app/globals.css` | 蓝白视觉、桌面/手机布局、键盘焦点与减少动态效果 |
| `src/components/knowledge-app.tsx` | 导航、搜索、卡片、阅读与分享交互 |
| `src/hooks/use-preferences.ts` | localStorage、跨标签页同步和保存失败处理 |
| `src/lib/taxonomy.ts` | 两级分类与专区定义 |
| `src/lib/knowledge.ts` | 知识类型、组合筛选、归档日期与分享链接 |
| `src/lib/preferences.ts` | 存储版本、异常恢复、收藏与隐藏的纯逻辑 |
| `src/lib/poster.ts` | 纯浏览器 PNG 海报生成 |
| `src/server/knowledge-repository.ts` | server-only 数据适配层 |
| `src/app/api/search/route.ts` | 联网搜索的明确未配置响应，HTTP 503 |
| `data/knowledge.json` | 迁入 30 条公开初始知识，按演示日期分组 |
| `data/special-seeds.json` | 3 条带出处的专区示例 |
| `data/README.md` | 日期、来源、字符规则和授权边界 |
| `scripts/import-legacy.mjs` | 显式的一次性导入工具，拒绝覆盖目标文件 |
| `public/icon.svg` | 见识书本图标 |
| `tests/unit/knowledge.test.ts` | 分类、数据契约、筛选、时区、存储异常与链接测试 |
| `tests/e2e/reading.spec.ts`、`playwright.config.ts` | 真实浏览器操作、失败状态和四种屏幕测试 |
| `.github/workflows/ci.yml` | GitHub Actions 的 quality-gate |
| `.github/pull_request_template.md` | 问题、改动、验证和限制的 PR 模板 |
| `README.md`、`LICENSE` | 开源项目说明与 MIT 许可 |
| `CONTRIBUTING.md`、`AGENTS.md` | 每次改动、验证和提交的约定 |
| `docs/GETTING-STARTED.md` | 安装、首次运行、身份配置、建仓与推送的完整命令 |
| `docs/GIT-WORKFLOW.md` | 功能分支、PR、分支保护与回退 |
| `docs/DEPLOYMENT.md` | Vercel 接入、CI 与部署的实际门禁关系 |
| `docs/ARCHITECTURE.md` | 技术栈、模块边界、偏好与旧站隔离的决策 |
| `docs/ROADMAP.md` | 抓取、AI 提炼、归档、实时搜索和账号同步的分期验收 |

## 验证方式

```powershell
npm ci
npm run check
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
Remove-Item Env:PLAYWRIGHT_CHANNEL
git diff --check
```

本地验证环境为 Windows、Node 24.15.0、npm 11.12.1、无界面 Edge。已验证生产构建、ESLint、TypeScript、9 项单元测试、12 项浏览器测试；360 / 390 / 768 / 1440 像素布局无水平溢出，并人工查看手机、桌面与下载海报。

GitHub CI 使用 Ubuntu + Playwright Chromium，本地 Edge 通过不能代替该远程检查结果。推送后的实际 CI 结果需另外确认。

## 初次提交命令

```powershell
git add .
git diff --cached --stat
git diff --cached --check
git commit -m "feat: bootstrap Jianshi Daily MVP"
git push -u origin main
```

如果助手已经完成首次提交与推送，上面是该次操作的可复现记录，无需再执行一次空提交。用 `git log -1 --oneline` 和 `git status --short --branch` 查看实际状态。

## 本次边界

新版没有迁移私人学习记录，没有配置 RSS、AI、联网服务或定时任务。新分类中暂时没有内容的类目显示空态。旧站继续保留。Vercel 必须由维护者登录账号导入 GitHub 仓库后才会产生部署；没有配置凭据时不会声称已经上线。
