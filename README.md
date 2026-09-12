# cf-server-monitor-theme-shadcn

A **React + shadcn/ui** theme for [CF-Server-Monitor](https://github.com/huilang-me/CF-Server-Monitor).

CF 探针（CF-Server-Monitor）的 **React + shadcn/ui** 主题。社区主题多为 Vue 3 / reka-ui，这是少见的 React 实现。

> 状态：可用（持续完善）。

## ✨ 功能

- **实时**：WebSocket 推送，连接状态三态（已连接 / 连接中 / 已断开）
- **视图**：卡片 / 表格 / 环形，切换记忆
- **指标**：CPU、内存、磁盘（数值 + 百分比）、负载、进程数、TCP/UDP、实时网速与累计流量
- **三网延迟**：电信 / 联通 / 移动 / BGP 当前值与历史曲线（无数据的线路自动隐藏）
- **丢包率**：三网丢包历史曲线
- **历史**：1h / 6h / 24h / 7d（未登录时服务端限制 ≤24h，自动降级）
- **计费**：价格 / 周期 / 到期倒计时 / 自动续费 / 月度流量进度 / 标签
- **筛选**：地区分组、离线排序
- **外观**：浅色 / 深色 / 跟随系统（含头部快捷切换）、主色预设、卡片透明度（毛玻璃）、卡片样式
- **加载态**：统一骨架屏

## 🎛️ 主题设置

右上角**调色板图标**打开侧边设置。分两层：

- **个人偏好**：外观模式、主色、卡片透明度、卡片样式、默认视图。写在 `localStorage`，即时生效，无需登录，仅影响本机。
- **站点默认**：点「设为站点默认」写回 CF-Server-Monitor 的 `theme_options`，对所有访客生效（**需先登录后台** `/admin`）。

> 背景图不在主题里设置，统一用 CF-Server-Monitor 后台的「自定义背景」(`custom_bg` / `custom_bg_mobile`)；卡片调半透明并开启毛玻璃即可透出。

`theme_options` 字段：

| 字段 | 说明 |
| --- | --- |
| `accent` | 主色：`default` / `blue` / `violet` / `emerald` / `teal` / `rose` / `amber` / `orange` |
| `cardOpacity` | 卡片透明度 60–100（100 = 不透明） |
| `cardStyle` | 卡片样式：`default` / `shine` / `neon` |
| `footer` | 自定义页脚文字（显示在 Powered by 上方） |

## 🚀 作为 CF-Server-Monitor 主题使用

后台 → **主题商店** 选择本主题与版本；或手动在主题设置里填 `theme_url`：

```
https://github.com/LanHuangJG/cf-server-monitor-theme-shadcn/tree/build
```

（用 `build` 分支会自动跟进；填具体 commit 可固定版本、缓存 1 天。撤销：清空 `theme_url`。）

## 🛠️ 本地开发

```bash
npm install
npm run dev
```

开发服务器默认把 `/api`、`/flags`、`/os-icons`（含 WebSocket）代理到 `https://status.ggaag.com`，可直接看到真实数据；用 `VITE_API_TARGET` 覆盖：

```bash
VITE_API_TARGET=https://your-cfsm.example.com npm run dev
```

构建：

```bash
npm run build      # 产物输出到 dist/（index.html + assets/）
```

主分支 push 后，GitHub Actions 自动构建并把 `dist/` 发布到 `build` 分支，供 CF-Server-Monitor 反代。

## 🧱 技术栈

- React 19 + Vite + TypeScript
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/)
- 图表：Recharts（经 shadcn `ChartContainer` 封装）
- 路由：React Router（HashRouter，`/#/`、`/#/server/:id`）

## 📐 主题规范

遵循 [CF-Server-Monitor 主题开发文档](https://github.com/huilang-me/CF-Server-Monitor/blob/main/theme-develop.md)：

- 产物仅 `index.html` + `assets/`，资源用 `/assets/...`
- 旗帜 `/flags/<code>.svg`、系统图标 `/os-icons/<file>` 走默认皮肤，不打包
- 页脚展示 `Powered by CF-Server-Monitor` 与版本号
- 管理入口链接到 `/admin#admin`，不实现后台

## 🙏 参考的社区注册表

组件按 shadcn 注册表格式可复用，本主题借鉴了以下社区实现（均为零依赖等价实现，避免引入 `motion` 等大包）：

- [Magic UI](https://magicui.design/) — NumberTicker 数字滚动
- [OpenStatus](https://github.com/openstatusHQ/openstatus) — 状态页在线率色带风格
- [Origin UI](https://originui.com/)、[ReUI](https://reui.io/)、[Tremor](https://tremor.so/) — 产品型组件与图表参考

## 📄 License

MIT

## ⚠️ 免责声明

第三方主题，与 CF-Server-Monitor 官方无隶属关系。"shadcn" 指 shadcn/ui 设计体系，本主题为独立实现。
