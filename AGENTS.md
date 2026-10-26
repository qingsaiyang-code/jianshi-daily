# Jianshi Daily 工程约定

这是技术初学者的第一个独立开源项目。先读 README、CONTRIBUTING 与 docs/ARCHITECTURE.md，帮助维护者理解实际改动。

- 交付说明必须包含：改动文件及目的、实际测试结果、未完成边界、可复制的推荐 Git 提交命令。
- 使用 Next.js App Router、TypeScript、npm 和锁定文件；不顺手引入独立服务器或第二套包管理器。
- 保持 src/components、src/lib、src/server、src/app/api 和 data 的职责边界；密钥只能由服务端读取。
- 不把种子数据、已有内容轮选或未接入的联网搜索描述为自动生成内容。
- 收藏和隐藏写入失败时不得显示成功；维持稳定卡片 ID、数据格式版本与分享链接。
- 业务改动执行 npm run check；交互、路由和存储改动再执行 npm run test:e2e。仅为有意义的边界增加测试。
- 后续功能从 main 新建分支，经 PR、quality-gate 和人工验收后合并。遵守远端 main 保护，避免直接推送。
- 一个提交解决一个完整问题；不重写已发布历史，不提交私人数据、密钥、构建或测试产物。
- 新版独立仓库与旧版 Sites 分离。修改旧站必须按用户当次需求确认范围，不能把新版部署到旧站或覆盖旧云端数据。
