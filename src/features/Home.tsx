"use client";
import HomeSections from "@/components/HomeSections";
import showcase from "@/components/motion/showcase.module.css";
import motionStyles from "@/components/motion/interactions.module.css";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { SectionHeading } from "@/components/marathon";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, Axis3D, BookOpen, Cat, Network, Rocket } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import styles from "./Home.module.css";

const GraphicPlaneBackground = dynamic(() => import("@/components/GraphicPlaneBackground"), { ssr: false });
export default function Home() {
    const { t } = useTranslation();
    const projects = [
        { name: "LauncherX", description: t("lxDescription"), href: "/lx", Icon: Rocket },
        {
            name: "ProjBobcat",
            description: t("projbobcatDescription"),
            href: "https://github.com/Corona-Studio/ProjBobcat",
            Icon: Cat
        },
        {
            name: "ConnectX",
            description: t("connectxDescription"),
            href: "https://github.com/Corona-Studio/ConnectX",
            Icon: Network
        },
        { name: "CSKB", description: t("cskbDescription"), href: "https://kb.corona.studio/", Icon: BookOpen },
        {
            name: "Hive.Framework",
            description: t("hiveDescription"),
            href: "https://github.com/Corona-Studio/Hive.Framework",
            Icon: Axis3D
        }
    ];
    return (
        <>
            <section className={`${styles.hero} bg-background text-foreground`}>
                <GraphicPlaneBackground />
                <div className="m-container">
                    <div className={`${styles.heroCopy} ${motionStyles.intro}`}>
                        <div className={`m-kicker mb-8 text-muted-foreground ${showcase.heroBadge}`}>
                            [ CS—001 ] / {t("welcomeAccess")}
                        </div>
                        <h1>
                            CORONA
                            <br />
                            STUDIO<span className="text-primary">/</span>
                        </h1>
                        <p className="text-2xl font-bold">{t("corona_studio")}</p>
                        <p className="text-foreground leading-7">
                            {t("weDevelop")} LauncherX / ProjBobcat / ConnectX
                            <br />
                            {t("home.featureDescription")}
                        </p>
                        <div className="m-actions">
                            <Button asChild size="lg">
                                <Link href="/lx/download">
                                    {t("home.download")}
                                    <ArrowRight />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="bg-background/30 border-foreground/40 text-foreground hover:bg-primary hover:text-primary-foreground">
                                <a href="#projects">
                                    {t("ourProjects")}
                                    <ArrowUpRight />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
            <div className="m-ticker">
                <span>PLAY / BUILD / CONNECT</span>
                <span>INDEPENDENT SINCE 2016</span>
            </div>
            <section className="m-section">
                <div className="m-container">
                    <SectionHeading code="01 / THE STUDIO" title={t("whoWeAre")} description={t("whoWeAreDetail")} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[1, 7, 12, 20].map((index) => (
                            <ScrollReveal asChild key={index} index={index % 4} zoom>
                                <div key={index} className="relative border border-border">
                                    <Image
                                        src={`/assets/landscapes/${index}.webp`}
                                        alt={`Minecraft 社区世界 ${index}`}
                                        width={640}
                                        height={360}
                                        sizes="(max-width: 640px) 100vw, 33vw"
                                        loading="lazy"
                                        className="aspect-[4/3] object-cover"
                                    />
                                    <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground font-mono text-[10px] px-2 py-1">
                                        WORLD / {String(index).padStart(3, "0")}
                                    </span>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
            <HomeSections placement="featured" />
            <section className="m-section" id="projects">
                <div className="m-container">
                    <SectionHeading code="03 / PROJECT INDEX" title={t("ourProjects")} />
                    <div className="m-grid">
                        {projects.map(({ name, description, href, Icon }, index) => (
                            <ScrollReveal asChild key={name} index={index % 3}>
                                <Link
                                    key={name}
                                    href={href}
                                    target={href.startsWith("https") ? "_blank" : undefined}
                                    rel={href.startsWith("https") ? "noopener noreferrer" : undefined}
                                    className="group hover:bg-primary hover:text-primary-foreground transition-colors">
                                    <div className="flex justify-between items-center mb-12">
                                        <span className="m-kicker group-hover:text-current">[ 0{index + 1} ]</span>
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="text-3xl">{name}</h3>
                                    <p className="group-hover:text-current">{description}</p>
                                    <ArrowUpRight className="size-6" />
                                </Link>
                            </ScrollReveal>
                        ))}
                        <ScrollReveal asChild index={2}>
                            <div className="flex flex-col justify-between bg-foreground text-background">
                                <p className="font-mono text-xs text-background">THE NEXT IDEA IS YOURS.</p>
                                <h3 className="text-4xl">
                                    BUILD
                                    <br />
                                    WHAT’S NEXT.
                                </h3>
                                <a
                                    href="https://github.com/Corona-Studio"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-8 flex items-center gap-3 text-sm">
                                    GITHUB
                                    <ArrowUpRight className="size-5" />
                                </a>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>
            <HomeSections placement="community" />
        </>
    );
}
