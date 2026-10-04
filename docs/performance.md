# 首屏性能与 Lighthouse 复测

测量日期：2026-10-04。目标为本地生产构建的 `/`，使用 Lighthouse 13.5.0、Chrome 154，默认 mobile / simulated throttling（4 倍 CPU、1638.4 Kbps、150 ms RTT）。浏览器缓存每次独立；本地测量不包含公网 CDN、真实用户网络和生产 TTFB。

## 优化前后

移动端各运行三次，下面按每项指标分别取中位数。

| 指标              |    优化前 |    优化后 |
| ----------------- | --------: | --------: |
| Performance       |        70 |        94 |
| FCP               |   0.908 s |   0.906 s |
| LCP               |   5.132 s |   3.109 s |
| TBT               |   42.5 ms |     40 ms |
| CLS               |     0.213 |         0 |
| JavaScript 传输量 | 508.0 KiB | 487.2 KiB |
| 图片传输量        | 129.2 KiB |  68.0 KiB |

LCP 减少约 39.4%，图片传输量减少约 47.4%。优化前分数为 54、72、70，优化后为 94、94、94；基线第一次 TBT 为 539 ms，其余两次为 28.5 和 42.5 ms，所以不将第一次的异常高值作为稳定收益。FCP 和 TBT 的中位数基本持平。

另外进行一次 desktop 检查，结果为 100 分、LCP 0.681 s、TBT 0 ms、CLS 0。桌面端没有优化前对照，不能据此计算提升幅度。移动端 LCP 仍高于 2.5 s，后续需要结合线上 Speed Insights 判断真实用户收益。

## 加载边界

- 保留 Next.js App Router / Turbopack 自带的路由分包，不引入 Webpack `splitChunks` 配置。额外开启 `radix-ui`、`motion` 和 Marathon barrel 的 `optimizePackageImports`，减少无关模块；该 Next.js 配置仍标记为 experimental，升级后应复测。
- `QueryProvider` 只在 `/user`、`/admin`、`/lx/download` 路由挂载，保留原来的查询缓存参数。跨这些路由组会重新建立缓存。
- `MotionProvider` 收敛到 LauncherX 的 `PreviewSwap`，首页无需加载 `LazyMotion` features。
- 首页 Three.js 背景保持独立 dynamic chunk；先通过 SSR 输出原有渐变、遮罩和标记，等关键资源的 `load` 和浏览器空闲后再下载 WebGL。保留动画，不依赖人为长延时或识别 Lighthouse；导航时取消待执行任务。
- 去掉根布局与首页的整页 Suspense，以及全站 loading boundary。原占位会先把页脚放到首屏附近，再因正文替换产生 0.213 的 CLS。数据路由保留局部 loading；账号 ConsoleShell 的 `useSearchParams` 保留必要的 Suspense。
- 首次访问直接显示正文；首页不再给 LCP 内容加淡入，整页淡入只用于后续客户端路由切换。
- 社区图片 `sizes` 与真实的两列/四列网格一致，并设置 `w-full`。保留 Next Image、lazy loading 和 logo preload。

总传输量包含最终仍会加载的 Three.js 与浏览器自动预取资源，不等同于关键首屏 JS 大小。没有通过关闭背景功能来降低报告的总资源量。

## 复测

需要安装 Chrome，以及项目依赖；首次审计会通过 npm 获取固定版本的 Lighthouse。

```bash
pnpm build
pnpm exec next start -p 3217
# 另一个终端，避免同时运行构建、测试或其他审计
pnpm perf:audit http://localhost:3217 before 3 mobile
# 应用优化并重新构建、重启生产服务后
pnpm perf:audit http://localhost:3217 after 3 mobile
pnpm perf:audit http://localhost:3217 after 3 desktop
```

同一标签会覆盖先前的报告。报告写入 `reports/lighthouse/`，包含每次 HTML、JSON 和中位数 summary；该目录已加入 gitignore，避免提交大体积审计输出。本次 before / after 的移动端各三份原始报告均保留在本地。重测时应保持机器负载、浏览器版本、URL、语言和主题一致。

## 验证与限制

生产构建、TypeScript、ESLint、样式检查均通过；23 个测试文件、115 项测试通过。新增测试覆盖 WebGL 延后加载的 SSR、空闲调度及卸载取消，以及首次绘制与路由动画。浏览器检查确认首屏背景、轮播切换、语言切换、LauncherX 与下载页，以及未登录账号和管理员的登录跳转。

浏览器额外检查发现：持久化英文后整页重新进入 `/lx` 和登录页时，存在 React #418 文本 hydration 警告；默认中文路径未出现该警告。语言恢复仍使用原来的全局 i18n 初始化逻辑，本次性能改动没有调整此行为，暂不宣称英文整页重载已通过 hydration 检查。

实现参考：[Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading)、[package bundling](https://nextjs.org/docs/app/guides/package-bundling)，并以项目安装的 Next.js 16.3.8 文档为准。
