# SEO 与机器可读内容

公开索引覆盖 `/`、`/lx`、`/lx/download`、`/cmfs`，以 `https://corona.studio` 为正式域名。`src/lib/seo.ts` 是标题、描述、canonical、社交分享及机器可读内容的共同来源。新增或修改公开页面时，应同步修改该文件及审计脚本的页面列表。

## 搜索与分享

- 每个公开页面独立输出 title、description、canonical、Open Graph 和 Twitter Card；分享卡片在构建时生成为 1200×630 PNG，不依赖外部字体或图片服务。
- 页面服务端输出 Organization、WebSite、WebPage / CollectionPage，内部页面另有 BreadcrumbList；LauncherX 介绍页包含 SoftwareApplication。没有编造价格、评分、评论或版本号，软件结构化数据不代表已经满足 Google 软件富媒体结果的全部要求。
- `/sitemap.xml` 在构建时生成，只收录公开 HTML canonical，带页面图片。没有以每次构建时间伪造内容的 `lastModified`。
- `/robots.txt` 声明 sitemap，排除用户中心、后台、组件演示和下载完成页面。登录、注册等 `/auth` 页面允许抓取，但保留 `noindex`，让搜索引擎读取不收录指令。上述非公开内容页面都输出 `noindex`。robots 不是访问控制，也不能用于移除已经收录的 URL；已收录页面需允许爬取 noindex，或在 Search Console 处理移除。
- 页脚链接 `/sitemap` 提供可爬取的页面导航。该辅助页面为 `noindex, follow`。
- 当前页面默认 SSR 中文；浏览器切换英文没有独立英文 URL，因此不输出不真实的 hreflang。

## 静态索引与 Markdown

下列路由全部在 `next build` 时预渲染，无需请求下载 API：

| 路径                              | 用途                                           |
| --------------------------------- | ---------------------------------------------- |
| `/llms.txt`                       | 公开页面与 Markdown 的发现索引                 |
| `/llms-full.txt`                  | 合并各页面的 Markdown 内容摘要                 |
| `/index.json`                     | 标题、描述、canonical、Markdown URL 和正文摘要 |
| `/markdown/home.md`               | 首页摘要                                       |
| `/markdown/launcherx.md`          | LauncherX 摘要                                 |
| `/markdown/launcherx-download.md` | 下载中心摘要                                   |
| `/markdown/cmfs.md`               | CMFS 摘要                                      |

Markdown 是人工维护的公开内容摘要，并非 HTML 全文自动转换。动态构建列表不写进静态摘要，避免下载地址和版本号过期。修改页面正文时同步维护摘要。Markdown 路由声明 `text/markdown; charset=utf-8`，带 HTML canonical 和 `X-Robots-Tag: noindex`，避免作为重复网页收录。

公开 HTML 路由也支持 HTTP 内容协商：

```bash
curl -H "Accept: text/markdown" https://corona.studio/lx
curl -I -H "Accept: text/markdown" https://corona.studio/lx
curl -H "Accept: text/html,text/markdown;q=0.5" https://corona.studio/lx
```

仅显式接受 Markdown 且其权重不低于 HTML 时返回 Markdown；通配符请求保持 HTML。响应包含 `Vary: Accept`，协商后的 Markdown 为 `private, no-store`，避免 CDN 将文本变体缓存给浏览器。RSC 和预取请求保持 Next.js 协议。HTML 提供 Markdown alternate link，独立静态 Markdown URL 适用于不支持内容协商的客户端。若部署平台配置了强制缓存或忽略源站缓存头，需要调整相应 CDN 规则。

该实现不需要开启 Cloudflare 控制台功能。[Cloudflare Markdown for Agents 文档](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)说明了相同的 Accept 内容协商机制；`llms.txt` 和 Markdown 提升内容可读取性，不保证搜索排名或 AI 引用。

## 评分与复测

2026-10-13 在本地生产服务使用 Lighthouse 13.5.0 移动端 SEO 分类实测：首页、LauncherX 介绍页、下载页、CMFS 均为 **100/100**，没有自动评分项失败。该评分不是搜索排名保证；上线后的域名、CDN 和抓取状态需另外检查。

```bash
pnpm build
pnpm exec next start -p 3217
# 在另一个终端执行
pnpm seo:audit http://localhost:3217
# 仅验证 HTTP 集成行为，不重复运行 Lighthouse
pnpm seo:audit http://localhost:3217 --checks-only
```

审计脚本先验证真实 HTTP 响应的 metadata、单一 H1、结构化数据 JSON、robots/noindex、sitemap、分享图片、静态索引、Markdown 内容一致性、格式权重、HEAD 和未知 Markdown 404，再逐页运行 Lighthouse 13.5.0 的移动端 SEO 分类。

报告位于 `reports/lighthouse/seo-{0..3}.report.html` / `.json` 和 `seo-summary.json`，已通过现有规则忽略。该命令可在 Windows 下运行，使用 Node 调用 npm CLI 获取固定版本 Lighthouse；需要安装 Chrome。仅评测 SEO 分类，不表示性能、可访问性或真实排名满分。Lighthouse 的结构化数据手动审计仍需使用 [Schema Markup Validator](https://validator.schema.org/) 或 [Google Rich Results Test](https://search.google.com/test/rich-results) 验证。

上线后在 Search Console 提交 `https://corona.studio/sitemap.xml`，并复查线上 robots、canonical 与 Markdown 协商。当前改动未部署，未提交站点地图至搜索引擎。
