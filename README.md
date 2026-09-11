# cf-server-monitor-theme-shadcn

A **React + shadcn/ui** theme for [CF-Server-Monitor](https://github.com/huilang-me/CF-Server-Monitor).

CF 探针（CF-Server-Monitor）的 **React + shadcn/ui** 主题。目前社区主题多为 Vue 3 / reka-ui，这是少见的 React 实现。

> 状态：🚧 开发中（scaffold）。首个可用版本发布前请不要用于生产。

## ✨ 计划特性

- [ ] 基于 shadcn/ui 的组件与设计令牌，Tailwind CSS
- [ ] 服务器卡片列表（CPU / 内存 / 磁盘 / 网络 / 负载 / 进程 / 连接）
- [ ] WebSocket 实时数据（`/api/ws`）
- [ ] 节点详情页 + 历史曲线（`/api/history/all`）
- [ ] 浅色 / 深色主题，响应式（桌面 + 移动）
- [ ] 分组 / 地区筛选、离线排序
- [ ] 深链路由：`/#/`、`/#/server/:id`

## 🧱 技术栈

- React + Vite + TypeScript
- Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
- 图表：Recharts（或 ECharts）

## 🚀 作为 CF-Server-Monitor 主题使用

构建产物为 `index.html` + `assets/`，CF-Server-Monitor 会反代所选版本的这两个入口。

**方式一：后台主题商店**
主题收录后，在 CF-Server-Monitor 后台 → 主题商店 中选择本主题与版本即可。

**方式二：手动填写 `theme_url`**
后台 → 外观 → 主题，填入本仓库某个含构建产物的 commit / 分支的 tree 地址：

```
https://github.com/LanHuangJG/cf-server-monitor-theme-shadcn/tree/<commit-or-branch>
```

## 🛠️ 本地开发

```bash
npm install
npm run dev
```

开发服务器默认把 `/api`、`/flags`、`/os-icons`（含 WebSocket）代理到
`https://status.ggaag.com`，可直接看到真实数据；用 `VITE_API_TARGET` 覆盖：

```bash
VITE_API_TARGET=https://your-cfsm.example.com npm run dev
```

构建：

```bash
npm run build      # 产物输出到 dist/
```

主分支 push 后，GitHub Actions 会自动构建并把 `dist/` 发布到 `build` 分支，
供 CF-Server-Monitor 反代。

## 📐 主题规范

遵循 CF-Server-Monitor 的[主题开发文档](https://github.com/huilang-me/CF-Server-Monitor/blob/main/theme-develop.md)：

- 构建产物仅 `index.html` + `assets/`，资源使用 `/assets/...`
- 路由：`/#/`、`/#/server/:id`；管理入口链接到 `/admin#admin`，不实现后台
- 旗帜 `/flags/<code>.svg`、系统图标 `/os-icons/<file>` 走默认皮肤，不打包
- 页脚展示 `Powered by CF-Server-Monitor` 与版本号

## 📄 License

MIT

## ⚠️ 免责声明

本主题为第三方主题，与 CF-Server-Monitor 官方无隶属关系。"shadcn" 指 [shadcn/ui](https://ui.shadcn.com/) 设计体系，本主题为独立实现。
