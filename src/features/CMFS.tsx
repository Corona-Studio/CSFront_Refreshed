"use client";
import { SectionHeading } from "@/components/marathon";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function CMFS() {
    const { t } = useTranslation();
    const servers = [
        { url: "https://craftmine.fun/cmfs/pure/survival", name: "pure.craftmine.fun", label: "SURVIVAL", image: 1 },
        {
            url: "https://craftmine.fun/cmfs/pure/radost",
            name: "pure.craftmine.fun 小游戏",
            label: "MINIGAMES",
            image: 10
        },
        { url: "https://craftmine.fun/cmfs/mood/lappland", name: "lapp.cmfs.kami.su", label: "LAPPLAND", image: 15 }
    ];
    return (
        <>
            <section className="relative overflow-hidden bg-[#11120e] text-white">
                <Image
                    src="/assets/landscapes/20.webp"
                    alt="CMFS Minecraft 世界"
                    width={1920}
                    height={1080}
                    sizes="100vw"
                    fetchPriority="high"
                    className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
                <div className="m-container relative py-24 md:py-40">
                    <p className="m-kicker text-white mb-10">CMFS—001 / COMMUNITY WORLDS</p>
                    <h1 className="m-display">
                        MAKE WORLDS.
                        <br />
                        MAKE FRIENDS<span className="text-primary">/</span>
                    </h1>
                    <p className="text-2xl font-bold mt-8">CMFS · CraftMineFun</p>
                    <div className="m-actions">
                        <Button asChild size="lg">
                            <a href="#servers">
                                {t("joinServer")}
                                <ArrowUpRight />
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white">
                            <a href="https://craftmine.fun" target="_blank" rel="noopener noreferrer">
                                {t("learnMore")}
                                <ArrowUpRight />
                            </a>
                        </Button>
                    </div>
                </div>
            </section>
            <section className="m-section" id="servers">
                <div className="m-container">
                    <SectionHeading code="01 / SERVER DIRECTORY" title={t("serverList")} />
                    <div className="m-grid">
                        {servers.map((server) => (
                            <a
                                href={server.url}
                                key={server.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group !p-0">
                                <Image
                                    src={`/assets/landscapes/${server.image}.webp`}
                                    alt={server.name}
                                    width={640}
                                    height={360}
                                    sizes="(max-width: 640px) 100vw, 33vw"
                                    loading="lazy"
                                    className="aspect-video object-cover"
                                />
                                <div className="p-6 group-hover:bg-primary group-hover:text-primary-foreground">
                                    <p className="m-kicker mb-6 group-hover:text-current">{server.label}</p>
                                    <h3>{server.name}</h3>
                                    <ArrowUpRight className="mt-6 size-5" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
            <section className="m-section">
                <div className="m-container grid lg:grid-cols-2 gap-12">
                    <SectionHeading
                        code="02 / ORIGINS"
                        title={t("beginningOfEverything")}
                        description={
                            <>
                                {t("beginningOfEverythingDescription1")}
                                <br />
                                {t("beginningOfEverythingDescription2")}
                            </>
                        }
                    />
                    <ol className="border-t border-border">
                        {Array.from({ length: 9 }, (_, index) => (
                            <li key={index} className="grid grid-cols-[70px_1fr] gap-6 border-b border-border py-6">
                                <span className="m-kicker">{2016 + index}</span>
                                <div>
                                    <h3>{t(`event${index + 1}`)}</h3>
                                    <p className="text-muted-foreground text-sm mt-3 leading-7">
                                        {t(`event${index + 1}Description`)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </>
    );
}
