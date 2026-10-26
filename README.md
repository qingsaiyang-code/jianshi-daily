# 每日见识 · Jianshi Daily

每天多懂一点。从生活常识到专业通识，积累能解释世界的知识卡片。

这是独立开源版本的第一个 MVP，也是一个用来练习 Git、Pull Request、自动测试和持续部署的项目。维护者：[qingsaiyang-code](https://github.com/qingsaiyang-code)。

## 开始使用

安装 **Node.js 24、Git、VS Code**。Windows 推荐使用 PowerShell；若 npm.ps1 被执行策略拦截，可把命令中的 `npm` 换为 `npm.cmd`，无需修改系统执行策略。

```powershell
npm ci
npm run dev
```

浏览器打开 <http://127.0.0.1:3000>。按 Ctrl+C 停止。首版不需要数据库、账号或任何 API Key。

## 当前能力

- 生活常识 / 专业通识两级导航；AI 前沿、军事防务、热点背景三个专区。
- 33 条明确标记的种子知识，分在 3 个演示归档日期中；支持日期和分类组合筛选。
- 标题、正文、要点和标签全文搜索；开始搜索时自动切换到全部归档。
- 收藏、不感兴趣、隐藏恢复；保存在当前浏览器，跨标签页同步。
- 独立分享链接 `/?card=<id>`、阅读弹窗、原始来源链接、PNG 海报下载。
- 桌面与手机布局、键盘导航、对话框焦点约束、减少动态效果偏好。

**尚未实现**：RSS/API 自动采集、AI 自动提炼、每日定时更新、实时联网问答、云端账号同步。`POST /api/search` 明确返回 503，不会返回虚构结果。隐藏偏好目前只用于排除相应卡片，还没有推荐算法。

## 验证命令

```powershell
npm run check                 # ESLint、TypeScript、单元测试、生产构建
npx playwright install chromium
npm run test:e2e              # 需先完成生产构建；测试会启动本地服务
```

Windows 已安装 Edge 时，也可以不用额外下载浏览器：

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm run test:e2e
Remove-Item Env:PLAYWRIGHT_CHANNEL
```

## 项目结构

```text
jianshi-daily/
├─ src/
│  ├─ app/                    # Next.js 页面、全局样式、服务端 API 入口
│  │  └─ api/search/          # 后续联网搜索接口；当前明确返回未配置
│  ├─ components/            # 交互界面与知识卡片
│  ├─ hooks/                 # 浏览器偏好存储
│  ├─ lib/                   # 分类、筛选、数据契约、海报等纯逻辑
│  └─ server/                # 仅服务端可用的数据读取层
├─ data/                     # 可审查的知识 JSON 与来源说明
├─ scripts/                  # 显式的一次性旧内容导入工具
├─ tests/unit/               # 业务与数据契约测试
├─ tests/e2e/                # Playwright 浏览器操作测试
├─ docs/                     # 新手上手、架构、Git、部署与路线图
├─ .github/workflows/ci.yml  # PR / main 分支质量检查
└─ package-lock.json         # 固定完整依赖树，使用 npm ci 重现
```

用一个仓库管理前后端，在目录和导入边界上分离；首版不需要 monorepo 或单独维护服务器。

## 开发与发布

1. [从本机运行到第一次推送](docs/GETTING-STARTED.md)
2. [每次改动、测试与提交的规范](CONTRIBUTING.md)
3. [Git 分支和 PR 操作手册](docs/GIT-WORKFLOW.md)
4. [Vercel 与 GitHub Actions 部署](docs/DEPLOYMENT.md)
5. [技术选择与边界](docs/ARCHITECTURE.md)
6. [后续功能的实施顺序](docs/ROADMAP.md)

## 与旧站的关系

此目录是独立 Git 项目；旧站继续保留在原 Sites 地址。这里仅迁入旧版的 30 条公开种子知识并新增 3 条专区示例，不含旧站云端私人笔记、收藏、阅读记录、数据库或访问凭据。此版本也没有复制 Sites 托管配置，不会操作旧站。

当前收藏保存在浏览器 localStorage，清理站点数据或更换浏览器后不会自动恢复。分享链接在本地运行时只能供本机访问；部署后生成的链接才使用线上域名。

## 开源与来源

项目自有代码和自编中文说明采用 [MIT License](LICENSE)。链接指向的第三方文章、机构标识及其原始材料仍适用各自的条款；本项目不重新许可这些原文。详见 [数据来源](data/README.md)。
