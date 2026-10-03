# 🎉 CSFront Refreshed

这是全面焕新的日冕工作室新的官方网站

This is the renewed official website for Corona Studio!

![image](https://github.com/user-attachments/assets/72f7ad62-8faf-4f30-bcbe-b15da45a7492)

## 📃 多语言支持

目前站点的多语言支持还处于早期阶段，我们欢迎志愿者来贡献其他地区的语言！

| 语言  | 进展 |
| :---- | :--- |
| zh_CN | ✅   |
| en_US | 🚧   |

## ⚙️ 页面概述

目前所有的主要功能均已经迁移到该项目，预计后期将关闭 CSFront Min 站

| 项目               | 进展 |
| :----------------- | :--- |
| 主页               | ✅   |
| LauncherX 宣传页面 | ✅   |
| LauncherX 下载页面 | ✅   |
| CMFS 宣传页面      | ✅   |
| 用户主页           | ✅   |
| 设备管理页面       | ✅   |
| 赞助者页面         | ✅   |
| 管理员页面         | 🚧   |

## 😄 仓库活动

![Alt](https://repobeats.axiom.co/api/embed/0218d1839b4a887b0ae3a2be9edb1135240910d6.svg "Repobeats analytics image")

## 🛠️ 本地开发

前端已迁移至 **Next.js App Router + shadcn/ui + Tailwind CSS 4**，使用统一的 Marathon 组件系统。

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

- `pnpm quality`：ESLint、单元测试、TypeScript 与生产构建。
- `pnpm build && pnpm start`：本地生产服务。
- `/design-system`：交互式 Marathon 组件展示。
- [架构、设计规则与部署迁移](docs/marathon.md)。
- [CSS 审计、样式架构与维护约定](docs/styles.md)；`pnpm lint:styles` 检查样式边界及模块引用。

注册使用 Cloudflare Turnstile：配置 `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 公钥，后端配置 `Turnstile__SecretKey` 私钥。API 默认地址为 `https://api.corona.studio`，可用 `NEXT_PUBLIC_LX_BACKEND` 修改。

旧 `VITE_*` 部署变量需要改名；Vercel 使用 Next.js preset，并清除旧 `dist` 输出目录和 SPA rewrite 设置。
