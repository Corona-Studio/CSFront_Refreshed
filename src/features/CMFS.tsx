"use client";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { SectionHeading } from "@/components/marathon";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Button } from "@/components/ui/button";

import styles from "./CMFS.module.css";
import motionStyles from "@/components/motion/interactions.module.css";

export default function CMFS() {
    const { t } = useTranslation();
    const servers = [
        {
            url: "https://craftmine.fun/cmfs/pure/survival",
            name: "pure.craftmine.fun",
            label: t("cmfsSurvival"),
            image: 1
        },
        {
            url: "https://craftmine.fun/cmfs/pure/radost",
            name: t("cmfsMinigamesName"),
            label: t("cmfsMinigames"),
            image: 10
        },
        {
            url: "https://craftmine.fun/cmfs/mood/lappland",
            name: "lapp.cmfs.kami.su",
            label: t("cmfsLappland"),
            image: 15
        }
    ];
    return (
        <>
            <section className="relative overflow-hidden bg-[#11120e] text-white">
                <Image
                    src="/assets/landscapes/20.webp"
                    alt=""
                    width={1920}
                    height={1080}
                    sizes="100vw"
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full object-cover opacity-35"
                />
                <div className={`m-container relative py-24 md:py-40 ${motionStyles.intro}`}>
                    <p className="m-kicker mb-10 text-white">CMFS—001 / {t("cmfsCommunityWorlds")}</p>
                    <h1 className={styles.heroTitle}>
                        <span>{t("cmfsHeroTitleWorlds")}</span>
                        <span>
                            {t("cmfsHeroTitleFriends")}
                            <span className="text-primary">/</span>
                        </span>
                    </h1>
                    <p className="mt-8 text-2xl font-bold">CMFS · CraftMineFun</p>
                    <div className="m-actions">
                        <Button asChild size="lg">
                            <a href="#servers">
                                {t("joinServer")}
                                <ArrowUpRight />
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="border-white bg-transparent text-white">
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
                    <SectionHeading code={`01 / ${t("cmfsServerDirectory")}`} title={t("serverList")} />
                    <div className="m-grid">
                        {servers.map((server, index) => (
                            <ScrollReveal asChild key={server.url} index={index} zoom>
                                <a
                                    href={server.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`group ${styles.serverCard}`}>
                                    <Image
                                        src={`/assets/landscapes/${server.image}.webp`}
                                        alt={server.name}
                                        width={640}
                                        height={360}
                                        sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 33vw"
                                        loading="lazy"
                                        className="aspect-video w-full object-cover"
                                    />
                                    <div
                                        className={`${styles.serverInfo} p-6 group-hover:bg-primary group-hover:text-primary-foreground`}>
                                        <p className="m-kicker mb-6 group-hover:text-current">{server.label}</p>
                                        <h3 className="break-words">{server.name}</h3>
                                        <ArrowUpRight className="mt-6 size-5" />
                                    </div>
                                </a>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
            <section className="m-section">
                <div className="m-container grid gap-12 lg:grid-cols-2">
                    <SectionHeading
                        code={`02 / ${t("cmfsOrigins")}`}
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
                        {([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((event, index) => (
                            <ScrollReveal asChild key={index} index={0}>
                                <li className="grid grid-cols-[70px_1fr] gap-6 border-b border-border py-6">
                                    <span className="m-kicker">{2016 + index}</span>
                                    <div>
                                        <h3>{t(`event${event}`)}</h3>
                                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                            {t(`event${event}Description`)}
                                        </p>
                                    </div>
                                </li>
                            </ScrollReveal>
                        ))}
                    </ol>
                </div>
            </section>
        </>
    );
}
