"use client";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { SectionHeading } from "@/components/marathon";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import showcase from "@/components/motion/showcase.module.css";

export default function HomeSections({ placement }: { placement: "featured" | "community" }) {
    const { t } = useTranslation();
    if (placement === "featured")
        return (
            <section className="m-section">
                <div className="m-container">
                    <div className="m-rule m-kicker">
                        <span>02 / FEATURED SYSTEM</span>
                        <span>LAUNCHERX — CROSS PLATFORM</span>
                    </div>
                    <div className="grid items-center gap-12 lg:grid-cols-2">
                        <ScrollReveal asChild>
                            <div>
                                <p className="m-kicker mb-6">BUILT FOR YOUR NEXT ADVENTURE</p>
                                <h2>{t("home.featureTitle")}</h2>
                                <p className="mt-6 max-w-lg leading-8 text-muted-foreground">
                                    {t("home.featureDescription")}
                                </p>
                                <div className="mt-6 flex gap-2">
                                    {["Windows", "macOS", "Linux"].map((os) => (
                                        <span className="border border-border px-3 py-2 font-mono text-xs" key={os}>
                                            {os}
                                        </span>
                                    ))}
                                </div>
                                <div className="m-actions">
                                    <Button asChild size="lg">
                                        <Link href="/lx/download">
                                            {t("home.download")}
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg">
                                        <Link href="/lx">
                                            {t("home.explore")}
                                            <ArrowUpRight />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal asChild zoom>
                            <figure className={showcase.frame}>
                                <div className="m-kicker flex justify-between border-b border-border px-4 py-3">
                                    <span>LX / INTERFACE</span>
                                    <span>01—32</span>
                                </div>
                                <div className={showcase.media}>
                                    <Image
                                        src="/assets/lx/LauncherX_1.webp"
                                        alt={t("home.previewAlt")}
                                        width={1280}
                                        height={720}
                                        sizes="(max-width: 900px) 100vw, 50vw"
                                        loading="lazy"
                                    />
                                </div>
                                <figcaption className={`m-kicker px-4 py-3 ${showcase.caption}`}>
                                    {t("home.previewCaption")}
                                </figcaption>
                            </figure>
                        </ScrollReveal>
                    </div>
                </div>
            </section>
        );
    const ecosystem = [
        { key: "play", name: "LauncherX", href: "/lx" },
        { key: "build", name: "ProjBobcat", href: "https://github.com/Corona-Studio/ProjBobcat" },
        { key: "connect", name: "ConnectX", href: "https://github.com/Corona-Studio/ConnectX" },
        { key: "learn", name: "CSKB", href: "https://kb.corona.studio/" }
    ] as const;
    return (
        <>
            <section className="m-section">
                <div className="m-container">
                    <SectionHeading
                        code="04 / ECOSYSTEM"
                        title={t("home.ecosystemTitle")}
                        description={t("home.ecosystemDescription")}
                    />
                    <div className="grid border border-border sm:grid-cols-2 lg:grid-cols-4">
                        {ecosystem.map((item, index) => (
                            <ScrollReveal asChild key={item.key} index={index % 4}>
                                <article className="border-b border-border p-6 sm:border-r" key={item.key}>
                                    <p className="m-kicker mb-8">
                                        0{index + 1} / {item.key.toUpperCase()}
                                    </p>
                                    <h3>{t(`home.${item.key}Title`)}</h3>
                                    <p className="my-4 text-sm leading-7 text-muted-foreground">
                                        {t(`home.${item.key}Description`)}
                                    </p>
                                    <Link
                                        href={item.href}
                                        target={item.href.startsWith("https") ? "_blank" : undefined}
                                        rel={item.href.startsWith("https") ? "noopener noreferrer" : undefined}
                                        className="flex items-center gap-2 text-sm font-bold">
                                        {item.name}
                                        <ArrowUpRight className="size-4" />
                                    </Link>
                                </article>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
            <section className="m-section">
                <div className="m-container">
                    <SectionHeading code="05 / PRINCIPLES" title={t("home.valuesTitle")} />
                    <div className="m-grid">
                        {(["experience", "open", "curiosity"] as const).map((key, index) => (
                            <ScrollReveal asChild key={key} index={index}>
                                <article key={key}>
                                    <p className="m-kicker">0{index + 1} /</p>
                                    <h3 className="mt-10">{t(`home.${key}Title`)}</h3>
                                    <p>{t(`home.${key}Description`)}</p>
                                </article>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
            <section className="m-section">
                <div className="m-container grid gap-12 lg:grid-cols-2">
                    <SectionHeading
                        code="06 / FIELD NOTES"
                        title={t("home.faqTitle")}
                        description={t("home.faqDescription")}
                    />
                    <ScrollReveal asChild>
                        <Accordion type="single" collapsible>
                            {(["start", "source", "help", "contribute"] as const).map((key) => (
                                <AccordionItem key={key} value={key}>
                                    <AccordionTrigger className="py-6 text-base">
                                        {t(`home.${key}Question`)}
                                    </AccordionTrigger>
                                    <AccordionContent className="leading-7 text-muted-foreground">
                                        {t(`home.${key}Answer`)}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ScrollReveal>
                </div>
            </section>
            <section className="bg-primary text-primary-foreground">
                <ScrollReveal asChild>
                    <div className="m-container py-16 md:py-24">
                        <p className="m-kicker mb-8 text-current">07 / LET’S BUILD WHAT’S NEXT</p>
                        <h2 className="max-w-3xl">{t("home.joinTitle")}</h2>
                        <p className="mt-6 max-w-xl leading-8">{t("home.joinDescription")}</p>
                        <div className="m-actions">
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="border-current bg-transparent text-current hover:bg-foreground hover:text-background">
                                <a href="https://github.com/Corona-Studio" target="_blank" rel="noopener noreferrer">
                                    {t("home.github")}
                                    <ArrowUpRight />
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="border-current bg-transparent text-current">
                                <a href="https://kb.corona.studio/" target="_blank" rel="noopener noreferrer">
                                    {t("home.knowledge")}
                                    <ArrowUpRight />
                                </a>
                            </Button>
                        </div>
                    </div>
                </ScrollReveal>
            </section>
        </>
    );
}
