# AGENTS.md

本仓库是一个基于 WXT、Vue 3 和 TypeScript 的浏览器扩展项目。
请将此文件作为 AI 编码代理的快速操作指南。

## 优先阅读

- 项目概览与开发说明：[README.md](README.md)
- 英文说明：[README_en.md](README_en.md)
- 发布历史：[CHANGELOG.md](CHANGELOG.md)
- 待优化事项：[TODO.md](TODO.md)

## 环境与命令

- 使用 Node.js 24+、TypeScript 6
- 安装依赖：`pnpm install`
- 启动开发（默认 Chrome）：`pnpm dev`
- Firefox 开发：`pnpm dev:firefox`
- Edge 开发：`pnpm dev:edge`
- 类型检查：`pnpm type-check`
- 全量 Lint：`pnpm lint`
- 构建：`pnpm build` / `pnpm build:firefox` / `pnpm build:edge`
- 打包：`pnpm zip` / `pnpm zip:firefox` / `pnpm zip:edge`

## 架构地图

- 后台 Service Worker 入口：[entrypoints/background/index.ts](entrypoints/background/index.ts)
- 新标签页启动顺序：[entrypoints/newtab/init.ts](entrypoints/newtab/init.ts) 然后 [entrypoints/newtab/main.ts](entrypoints/newtab/main.ts)
- 新标签页 UI 根组件：[entrypoints/newtab/App.vue](entrypoints/newtab/App.vue)
- 共享设置域：[shared/settings](shared/settings)
- 共享同步域：[shared/sync](shared/sync)
- 共享主题域：[shared/theme](shared/theme)
- i18n 运行时初始化：[shared/i18n.ts](shared/i18n.ts)
- 语言资源目录：[locales](locales)

## 仓库约定

- UI 组件优先使用 Vue SFC 的 `script setup` + TypeScript。
- 优先使用 [tsconfig.app.json](tsconfig.app.json) 中已有路径别名：`@/*` 和 `@newtab/*`。
- 变更尽量小而聚焦；除非明确要求，不做大范围重构。
- 遵循现有 Lint 体系：[eslint.config.ts](eslint.config.ts) 与 [stylelint.config.ts](stylelint.config.ts)。
- 不要手动编辑生成的声明文件：[types/auto-imports.d.ts](types/auto-imports.d.ts)、[types/components.d.ts](types/components.d.ts)。

## 高风险区域

- 设置 Schema 发生变化时，如果发生删除或更名必须同步更新迁移逻辑，添加新项不用升级配置版本。
- 如果设置结构变化，需要同时更新以下位置：
  - 当前版本：[shared/settings/current.ts](shared/settings/current.ts)
  - 存储迁移注册：[shared/settings/settingsStorage.ts](shared/settings/settingsStorage.ts)
  - 迁移实现：[shared/settings/migrate](shared/settings/migrate)
  - 默认值：[shared/settings/default.ts](shared/settings/default.ts)
- 启动阶段的向后兼容检查要保持稳定：[shared/settings/bootstrap.ts](shared/settings/bootstrap.ts)
- 后台同步逻辑要保持稳定；该逻辑有意合并为最新快照：[entrypoints/background/index.ts](entrypoints/background/index.ts)

## i18n 规则

- 命名空间使用要与 [shared/i18n.ts](shared/i18n.ts) 保持一致：`newtab`、`settings`、`sync`、`faq`。
- 新增或重命名翻译键时，要同步更新 [locales](locales) 下所有语言。

## 浏览器差异说明

- Manifest 与浏览器权限差异统一收敛在 [wxt.config.ts](wxt.config.ts)。
- 本地浏览器可执行文件覆盖配置在 [web-ext.config.ts](web-ext.config.ts)，与机器环境相关。

## 完成前校验清单

- 对任意 TypeScript/Vue 逻辑改动，执行 `pnpm type-check`。
- 执行 `pnpm lint` 做样式与静态检查。
- 如果构建流程或 Manifest 行为变化，执行对应的 build/zip 命令。
