import type { Metadata } from "next";

export const SITE_URL = "https://corona.studio";
export const publicPages = [
    {
        path: "/",
        slug: "home",
        title: "日冕工作室 · Minecraft 工具与开源项目",
        description:
            "日冕工作室 Corona Studio 是由 Minecraft 爱好者组建的开发团队。探索 LauncherX 启动器、ProjBobcat 启动核心、ConnectX、知识库与 CMFS 社区。",
        image: "/assets/logo.png",
        sections: [
            ["关于我们", "日冕工作室从 Minecraft 出发，开发游戏工具，通过开源项目与知识库分享代码和经验。"],
            [
                "项目",
                "- [LauncherX](/lx)：管理游戏版本、资源和整合包的 Minecraft 启动器。\n- [ProjBobcat](https://github.com/Corona-Studio/ProjBobcat)：开源 Minecraft 启动核心。\n- [ConnectX](https://github.com/Corona-Studio/ConnectX)：网络连接项目。\n- [Hive.Framework](https://github.com/Corona-Studio/Hive.Framework)：开发框架。\n- [CSKB](https://kb.corona.studio/)：使用指南与常见问题。\n- [CMFS](/cmfs)：Minecraft 社区与服务器。"
            ],
            [
                "开始使用",
                "前往 [LauncherX 下载中心](/lx/download)，或访问 [GitHub](https://github.com/Corona-Studio) 了解开源项目。"
            ]
        ]
    },
    {
        path: "/lx",
        slug: "launcherx",
        title: "LauncherX · Minecraft 启动器",
        description:
            "探索 LauncherX Minecraft 启动器：管理游戏版本、模组、资源与整合包，支持 Windows、macOS 和 Linux。查看功能与界面预览，前往官方下载中心。",
        image: "/assets/lx/LauncherX_1.webp",
        sections: [
            [
                "功能",
                "LauncherX 将游戏版本管理、模组与资源安装、整合包管理汇聚在一个界面中，让 Minecraft 游戏的准备工作更轻松。"
            ],
            ["支持平台", "Windows、macOS 和 Linux。请在下载中心根据操作系统与处理器架构选择构建。"],
            ["下载与帮助", "- [官方下载中心](/lx/download)\n- [使用指南与常见问题](https://kb.corona.studio/)"]
        ]
    },
    {
        path: "/lx/download",
        slug: "launcherx-download",
        title: "下载 LauncherX · Windows、macOS 与 Linux",
        description:
            "从日冕工作室官方下载 LauncherX Minecraft 启动器。选择适合 Windows、macOS、Linux 和 X64、ARM64 的稳定版构建，查看安装指南与使用帮助。",
        image: "/assets/lx/LauncherX_1.webp",
        sections: [
            [
                "选择构建",
                "下载中心根据操作系统和处理器架构推荐稳定版，也可以手动选择其他构建。支持 Windows、macOS、Linux，以及 X64 和 ARM64。当前稳定渠道使用 .NET 10。"
            ],
            [
                "实时版本",
                "版本列表、发布时间及下载地址由官方下载 API 实时提供。请打开 [下载页面](/lx/download) 查看可用构建；本文不缓存或推测最新版本号。"
            ],
            ["安装与帮助", "下载后按照安装指南操作。更多帮助见 [CSKB 知识库](https://kb.corona.studio/)。"]
        ]
    },
    {
        path: "/cmfs",
        slug: "cmfs",
        title: "CMFS · CraftMineFun Minecraft 社区",
        description:
            "了解 CMFS（CraftMineFun）Minecraft 社区，探索生存、小游戏与社区服务器，查看服务器目录和社区发展历程，与朋友一起创造与探索新世界。",
        image: "/assets/landscapes/20.webp",
        sections: [
            ["社区", "CMFS · CraftMineFun 提供 Minecraft 社区世界与服务器，连接玩家与朋友。"],
            [
                "服务器目录",
                "- [pure.craftmine.fun](https://craftmine.fun/cmfs/pure/survival)\n- [小游戏](https://craftmine.fun/cmfs/pure/radost)\n- [lapp.cmfs.kami.su](https://craftmine.fun/cmfs/mood/lappland)"
            ],
            ["了解更多", "访问 [CraftMineFun](https://craftmine.fun) 或查看 [社区页面](/cmfs) 的发展历程。"]
        ]
    }
] as const;

export type PublicPage = (typeof publicPages)[number];

export function pageMetadata(path: PublicPage["path"]): Metadata {
    const page = publicPages.find((page) => page.path === path)!;
    return {
        title: { absolute: `${page.title} · Corona Studio` },
        description: page.description,
        alternates: {
            canonical: `${SITE_URL}${page.path}`,
            types: { "text/markdown": `${SITE_URL}/markdown/${page.slug}.md` }
        },
        openGraph: {
            type: "website",
            locale: "zh_CN",
            siteName: "Corona Studio · 日冕工作室",
            url: `${SITE_URL}${page.path}`,
            title: page.title,
            description: page.description,
            images: [{ url: `/social/${page.slug}.png`, width: 1200, height: 630, alt: page.title }]
        },
        twitter: {
            card: "summary_large_image",
            title: page.title,
            description: page.description,
            images: [`/social/${page.slug}.png`]
        }
    };
}

export const noIndex: Metadata = { robots: { index: false, follow: false } };

export function pageMarkdown(page: PublicPage) {
    const content = `# ${page.title}\n\n${page.description}\n\n来源：${SITE_URL}${page.path}\n\n${page.sections.map(([heading, body]) => `## ${heading}\n\n${body}`).join("\n\n")}\n`;
    return content.replace(/\]\(\/(.*?)\)/g, `](${SITE_URL}/$1)`);
}

export function prefersMarkdown(accept: string | null): boolean {
    const entries = (accept ?? "")
        .toLowerCase()
        .split(",")
        .map((entry) => {
            const [type, ...parameters] = entry.trim().split(";");
            const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
            const q = quality ? Number(quality.trim().slice(2)) : 1;
            return { type: type.trim(), q: Number.isFinite(q) && q >= 0 && q <= 1 ? q : 0 };
        });
    const markdown = entries.find((entry) => entry.type === "text/markdown")?.q ?? 0;
    const html =
        entries.find((entry) => entry.type === "text/html")?.q ??
        entries.find((entry) => entry.type === "text/*")?.q ??
        entries.find((entry) => entry.type === "*/*")?.q ??
        0;
    return markdown > 0 && markdown >= html;
}
