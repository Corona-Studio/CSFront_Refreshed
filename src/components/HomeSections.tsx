"use client";
import ProgressiveBlur from "@/components/motion/progressive-blur";
import showcase from "@/components/motion/showcase.module.css";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { SectionHeading } from "@/components/marathon";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

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
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <ScrollReveal asChild>
                            <div>
                                <p className="m-kicker mb-6">BUILT FOR YOUR NEXT ADVENTURE</p>
                                <h2>{t("home.featureTitle")}</h2>
                                <p className="text-muted-foreground leading-8 mt-6 max-w-lg">
                                    {t("home.featureDescription")}
                                </p>
                                <div className="flex gap-2 mt-6">
                                    {["Windows", "macOS", "Linux"].map((os) => (
                                        <span className="border border-border font-mono text-xs px-3 py-2" key={os}>
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
                                <div className="m-kicker px-4 py-3 border-b border-border flex justify-between">
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
                                    <ProgressiveBlur direction="bottom" className={showcase.mediaBlur} />
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
    ];
    return (
        <>
            <section className="m-section">
                <div className="m-container">
                    <SectionHeading
                        code="04 / ECOSYSTEM"
                        title={t("home.ecosystemTitle")}
                        description={t("home.ecosystemDescription")}
                    />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 border border-border">
                        {ecosystem.map((item, index) => (
                            <ScrollReveal asChild key={item.key} index={index % 4}>
                                <article className="p-6 border-b sm:border-r border-border" key={item.key}>
                                    <p className="m-kicker mb-8">
                                        0{index + 1} / {item.key.toUpperCase()}
                                    </p>
                                    <h3>{t(`home.${item.key}Title`)}</h3>
                                    <p className="text-sm text-muted-foreground leading-7 my-4">
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
                        {["experience", "open", "curiosity"].map((key, index) => (
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
                <div className="m-container grid lg:grid-cols-2 gap-12">
                    <SectionHeading
                        code="06 / FIELD NOTES"
                        title={t("home.faqTitle")}
                        description={t("home.faqDescription")}
                    />
                    <ScrollReveal asChild>
                        <Accordion type="single" collapsible>
                            {["start", "source", "help", "contribute"].map((key) => (
                                <AccordionItem key={key} value={key}>
                                    <AccordionTrigger className="text-base py-6">
                                        {t(`home.${key}Question`)}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-7">
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
                        <p className="m-kicker text-current mb-8">07 / LET’S BUILD WHAT’S NEXT</p>
                        <h2 className="max-w-3xl">{t("home.joinTitle")}</h2>
                        <p className="max-w-xl mt-6 leading-8">{t("home.joinDescription")}</p>
                        <div className="m-actions">
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="bg-transparent border-current text-current hover:bg-foreground hover:text-background">
                                <a href="https://github.com/Corona-Studio" target="_blank" rel="noopener noreferrer">
                                    {t("home.github")}
                                    <ArrowUpRight />
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                className="bg-transparent border-current text-current">
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
