"use client";
import { SectionHeading } from "@/components/marathon";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function LxHome() {
    const { t } = useTranslation();
    const features = [
        { title: "ConnectX", description: "多人游戏更便利", label: "P2P / RELAY" },
        { title: "跨平台", description: "Linux、Windows、macOS 几乎一致的体验", label: "X64 / ARM64" },
        { title: "整合包", description: "主流平台整合包导入导出和资源安装支持", label: "CURSEFORGE / MODRINTH" },
        { title: "ProjBobcat", description: "安全、稳定、开源的自研启动核心", label: "LAUNCH CORE" },
        { title: "简洁美观", description: "极简外观，暗藏玄机", label: "DESIGNED TO PLAY" },
        { title: "多线下载", description: "最大化利用上下游带宽，高效便捷", label: "PARALLEL DOWNLOAD" }
    ];
    return (
        <>
            <section className="m-section">
                <div className="m-container">
                    <p className="m-kicker mb-8">LX—001 / MINECRAFT LAUNCHER</p>
                    <div className="grid lg:grid-cols-2 items-center gap-12">
                        <div>
                            <h1>
                                LAUNCH
                                <br />
                                WITHOUT
                                <br />
                                <span className="text-muted-foreground">LIMITS/</span>
                            </h1>
                            <p className="mt-8 text-2xl font-bold">LauncherX</p>
                            <p className="text-muted-foreground mt-4 leading-7">{t("lxSlogan")}</p>
                            <div className="m-actions">
                                <Button asChild size="lg">
                                    <Link href="/lx/download">
                                        {t("downloadNow")}
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            </div>
                            <p className="m-kicker mt-8">WINDOWS / MACOS / LINUX</p>
                        </div>
                        <figure className="border border-border">
                            <Image
                                src="/assets/lx/LauncherX_1.webp"
                                alt="LauncherX 主界面"
                                width={1280}
                                height={720}
                                sizes="(max-width: 900px) 100vw, 50vw"
                                fetchPriority="high"
                            />
                            <figcaption className="m-kicker border-t border-border p-4">
                                LX / BUILT FOR YOUR NEXT ADVENTURE
                            </figcaption>
                        </figure>
                    </div>
                </div>
            </section>
            <section className="m-section">
                <div className="m-container">
                    <SectionHeading code="01 / CAPABILITIES" title={t("talkIsCheap")} />
                    <div className="m-grid">
                        {features.map((feature, index) => (
                            <article key={feature.title}>
                                <div className="m-rule m-kicker">
                                    <span>0{index + 1}</span>
                                    <span>{feature.label}</span>
                                </div>
                                <h3 className="text-2xl">{feature.title}</h3>
                                <p>{feature.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
            <section className="m-section">
                <div className="m-container">
                    <SectionHeading
                        code="02 / INTERFACE"
                        title={t("powerfulFeatures")}
                        description={t("powerfulFeaturesDescription")}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                        {[3, 7, 11, 17].map((index) => (
                            <figure className="border border-border" key={index}>
                                <Image
                                    src={`/assets/lx/LauncherX_${index}.webp`}
                                    alt={`LauncherX 功能界面 ${index}`}
                                    loading="lazy"
                                    width={1280}
                                    height={720}
                                    sizes="(max-width: 900px) 100vw, 50vw"
                                />
                                <figcaption className="m-kicker p-3 border-t border-border">
                                    INTERFACE / {String(index).padStart(3, "0")}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>
            <section className="m-section">
                <div className="m-container grid md:grid-cols-2 gap-12">
                    <SectionHeading
                        code="03 / PERFORMANCE"
                        title={t("aggressiveOptimizing")}
                        description={t("aggressiveOptimizingDescription")}
                    />
                    <div>
                        <SectionHeading
                            code="04 / RESOURCES"
                            title={t("integratedWithThirdPartyResources")}
                            description={t("integratedWithThirdPartyResourcesDescription")}
                        />
                        <div className="flex items-center gap-6">
                            {["CurseForge", "Forge", "Modrinth"].map((name) => (
                                <Image
                                    key={name}
                                    src={`/assets/thirdparty/${name}.webp`}
                                    alt={name}
                                    width={72}
                                    height={72}
                                    loading="lazy"
                                    className="size-16 object-contain"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <section className="m-section bg-primary text-primary-foreground">
                <div className="m-container">
                    <p className="m-kicker text-current mb-6">05 / CONTINUOUS DEVELOPMENT</p>
                    <h2>{t("alwaysGetLatestUpdates")}</h2>
                    <p className="my-6 max-w-2xl leading-8">{t("alwaysGetLatestUpdatesDescription")}</p>
                    <Button asChild variant="outline" className="bg-transparent border-current text-current">
                        <Link href="/lx/download">
                            {t("downloadNow")}
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
            </section>
        </>
    );
}
