# 架构决策与首版范围

## ADR-001：一个仓库，清楚的模块边界

使用 Next.js App Router + React + TypeScript + 普通 CSS，部署到 Vercel。Node.js 固定为 24 系列；依赖通过 package-lock.json 锁定，CI 使用 npm ci。

Next.js 可把同一份仓库中的 UI 和服务端 API 分开，又不要求初学者维护两套部署或跨域。与 Astro 相比，本项目的收藏状态、实时搜索和未来服务端接口较多，React 交互模型更贴合这个迭代方向。首版数据量小，不引入搜索集群、Redis、消息队列、独立后端或 monorepo。

Next.js 的安装与运行要求以 [官方文档](https://nextjs.org/docs/app/getting-started/installation) 为准。开发工具跟随插件兼容性选择版本：ESLint 使用 Next.js 插件仍支持的 9.39.5，未来升级 ESLint 大版本时单独验证所有 peer dependencies。

```text
src/app/page.tsx（服务端）
  → src/server/knowledge-repository.ts（server-only）
    → data/*.json
  → src/components/knowledge-app.tsx（客户端）
    → src/lib/*（可独立测试的逻辑）
    → src/hooks/use-preferences.ts → localStorage

未来联网搜索：客户端 → app/api/search → server/搜索适配器 → 提供商
```

MVP 把公开知识传给客户端，支持即时检索；未来数据规模增大后改为分页 API。`server-only` 防止将来误把数据服务与密钥导入客户端，但它不让已经发送给浏览器的公开知识变成保密数据。

## ADR-002：知识、分类与归档

分类定义在 `src/lib/taxonomy.ts`。一级类别与二级类别是稳定 ID，显示文案可以独立修改；专区字段 `zone` 是额外维度，不作为第三个一级类别。卡片始终有一个一级和二级类别，专区可选。

`archiveDate` 用 `YYYY-MM-DD`，表示产品归档日期；未来流水线统一以 Asia/Shanghai 计算。现有 3 个日期是演示档期，全部条目 `contentKind: seed`，不代表新闻发生时间或真实自动发布历史。

筛选按查询、类别、日期、收藏和隐藏取交集。搜索开始时把日期改为“全部日期”，避免搜索框看似站内搜索却漏掉历史内容。尚未覆盖的二级类目显示有操作出口的空态，不伪造内容。

## ADR-003：首版浏览器偏好

收藏和隐藏存储在 `jianshi-daily:preferences:v1`，只保存稳定卡片 ID。通过 `useSyncExternalStore` 与 storage 事件同步多个标签页；初始服务端快照固定，避免读取浏览器状态导致水合不一致。

存储结构有版本号、损坏恢复和字段净化。保存失败时明确报告失败，不显示成功。隐藏不会删除知识或原收藏，恢复隐藏后仍能找回。首版偏好不随浏览器或设备自动同步。

## ADR-004：真实状态优先

联网问答是核心后续功能，当前入口显示未接入，API 返回带错误码的 503。自动抓取和每日内容生成均没有启用，没有注册 cron 或云端自动任务。每日展示已有内容、按日期读取静态档案、每天自动生成新知识是三种不同能力。

## 视觉设计

沿用旧版蓝白品牌，主色 `#3059d9`、阅读底色 `#f6f8fc`、纸白 `#ffffff`、正文 `#20304a`、次级文字 `#768399`，细线 `#e6ebf3`。

界面使用系统无衬线字体；问题标题优先使用中文衬线字体，保持阅读感，不依赖远程字体。桌面是左分类导航、中央知识流、右阅读导览；手机收起导航并加入横向分类入口。卡片用来源、标签和操作区体现信息层次，轨道插图表达跨领域知识的联系。

## 数据与旧站隔离

旧 Sites 的用户数据仍在原 D1 数据库。这里没有复制数据库、登录凭据、托管身份或部署归档。后续如需迁移私人学习档案，应另做显式导出、格式校验和导入流程，不能靠复制源码完成。
