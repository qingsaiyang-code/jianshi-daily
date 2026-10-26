# 从本地到第一个 GitHub 仓库

本指南为 Windows PowerShell 编写。项目目录已经建立，无需再运行 create-next-app。

## 1. 工具与版本

| 工具 | 用途 | 本机检查结果 |
| --- | --- | --- |
| [Node.js](https://nodejs.org/en/download) 24 | 运行 Next.js、npm 和测试 | v24.15.0，已安装 |
| npm | 按锁定文件安装依赖 | 11.12.1，随 Node 安装 |
| [Git](https://git-scm.com/downloads) | 管理版本与代码差异 | 2.54.0，已安装 |
| [VS Code](https://code.visualstudio.com/) | 阅读和修改项目 | 已安装 |
| [GitHub CLI](https://cli.github.com/) | 登录、创建仓库、创建 PR | 已安装，首次检查时登录失效 |

打开 VS Code 后，用“文件 → 打开文件夹”选择 `jianshi-daily`，不要选择上一级旧项目目录。VS Code 内按 Ctrl+` 打开终端。

```powershell
Set-Location 'C:\Users\yangq\Desktop\常识搭建\jianshi-daily'
node --version
npm --version
git --version
code .
```

## 2. 本地运行

```powershell
npm ci
npm run dev
```

打开 <http://127.0.0.1:3000>。试着搜索“光年”、切换日期、收藏一条卡片、刷新、打开“我的收藏”、隐藏并恢复卡片、复制分享链接和下载海报。

本地链接仅供本机使用。当前归档均为演示日期，卡片并不是当天实时抓取的新闻。按 Ctrl+C 停止服务后再验证生产版本。

```powershell
npm run check
npx playwright install chromium
npm run test:e2e
```

如果 PowerShell 拒绝运行 npm.ps1，使用 `npm.cmd` 和 `npx.cmd` 代替对应命令即可。

## 3. 第一个提交

本目录已执行 `git init -b main`，无须重复初始化。若从一个不含 Git 历史的源码包开始，才需要先运行它。

如果当前版本已经由助手提交并推送，以下是第一次操作的学习记录，不要重复提交；用 `git log -1 --oneline` 检查，再从 [功能分支流程](GIT-WORKFLOW.md) 开始下一项改动。

先确认提交身份。Git 的作者邮箱应是你在 GitHub 验证过的邮箱，或者 GitHub Settings → Emails 中显示的 noreply 邮箱。邮箱会写入提交历史。

```powershell
git config user.name
git config user.email
```

需要调整时，只设置当前仓库，不改全局：

```powershell
git config user.name 'qingsaiyang-code'
# 把下面占位文字换成 GitHub 中显示的真实邮箱后再执行
git config user.email '你的 GitHub 已验证邮箱或 noreply 邮箱'
```

提交前检查：

```powershell
git status --short
git diff --check
git add .
git diff --cached --stat
git diff --cached --check
git commit -m "feat: bootstrap Jianshi Daily MVP"
git log -1 --oneline
```

`git add` 把改动放进暂存区；`git commit` 在本地生成一个可以回看的版本。`.env*`、依赖、构建和测试产物已被忽略。

## 4. 登录并创建远程仓库

2026-10-26 检查时，本机 CLI 中 `qingsaiyang-code` 的登录已失效。浏览器登录不能替代 CLI 登录。你需要在自己的终端完成浏览器授权；无需把密码或 token 发给助手。

```powershell
gh auth login --hostname github.com --git-protocol https --web
gh auth status
gh auth setup-git
```

下面两个方案只选一个。仓库公开后代码可被任何人查看，符合本项目的开源目标。

### 方案 A：GitHub CLI（推荐）

先确认当前账号确实是 `qingsaiyang-code`。在项目根目录执行：

```powershell
gh repo create qingsaiyang-code/jianshi-daily --public --description "每日见识：每天多懂一点的开源知识卡片应用" --source . --remote origin --push
git remote -v
git status --short --branch
```

这个命令创建远程仓库、配置 origin 并推送。若仓库已经存在，不要重复创建，使用方案 B 中的 remote / push 命令。

### 方案 B：GitHub 网页建仓

打开 [创建仓库](https://github.com/new)，Owner 选择 `qingsaiyang-code`，名称填 `jianshi-daily`，选择 Public。**不要勾选生成 README、.gitignore 或 License**，因为本地已经有这些文件。

```powershell
git remote add origin https://github.com/qingsaiyang-code/jianshi-daily.git
git push -u origin main
```

若已有 origin，先用 `git remote -v` 检查地址；确认指向本项目后再推送，无须再次添加。如果远程已有提交，先停下来检查远程历史，不要用强制推送覆盖。

## 5. 确认完成

推送后打开 `https://github.com/qingsaiyang-code/jianshi-daily`，应能看到源码和 README；Actions 中出现 `CI`，其中检查名为 `quality-gate`。等待它通过，再按照 [部署指南](DEPLOYMENT.md) 导入 Vercel，并启用 main 分支保护。

首次完整链路是：本地通过 → 第一个提交 → GitHub → CI 通过 → Vercel 导入 → 手机打开部署网址。这个过程需要你本人登录 GitHub 与 Vercel；项目代码已经不依赖任何私有平台凭据。
