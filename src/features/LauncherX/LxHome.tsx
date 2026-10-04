"use client";
import PreviewSwap from "@/components/motion/preview-swap";
import motionStyles from "@/components/motion/interactions.module.css";
import showcase from "@/components/motion/showcase.module.css";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { SectionHeading } from "@/components/marathon";
import { Button } from "@/components/ui/button";
import { useCarousel } from "@/components/use-carousel";
import type { zhCN } from "@/langs/zh_CN";
import { ArrowRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function LxHome() {
    const { t } = useTranslation();
    const carousel = useCarousel(4);
    const activePreview = carousel.active;
    const copy = t("lxLanding", { returnObjects: true }) as typeof zhCN.translation.lxLanding;
    const previews = [
        { image: 1, caption: copy.home },
        { image: 2, caption: copy.versions },
        { image: 14, caption: copy.resources },
        { image: 20, caption: copy.personalPreview }
    ];
    const preview = previews[activePreview];
    const labels = [
        "P2P / RELAY",
        "X64 / ARM64",
        "CURSEFORGE / MODRINTH",
        "LAUNCH CORE",
        "DESIGNED TO PLAY",
        "PARALLEL DOWNLOAD"
    ];
    const features = copy.featureTitles.map((title, index) => ({
        title,
        description: copy.featureDescriptions[index],
        label: labels[index]
    }));
    const storyImages = [
        [2, 4],
        [13, 14],
        [20, 21]
    ];
    const storyCodes = ["02 / YOUR WORLDS", "03 / DISCOVER MORE", "04 / MAKE IT YOURS"];
    const screenshot = (index: number, caption: string) => (
        <ScrollReveal asChild zoom>
            <figure className={showcase.frame}>
                <div className={showcase.media}>
                    <Image
                        src={`/assets/lx/LauncherX_${index}.webp`}
                        alt={caption}
                        width={1280}
                        height={720}
                        sizes="(max-width: 1023px) 100vw, 55vw"
                        loading="lazy"
                        className="w-full"
                    />
                </div>
                <figcaption className={`m-kicker p-4 ${showcase.caption}`}>{caption}</figcaption>
            </figure>
        </ScrollReveal>
    );
    return (
        <>
            <section className="m-section">
                <div className="m-container">
                    <p className={`m-kicker mb-8 ${showcase.heroBadge}`}>LX—001 / MINECRAFT LAUNCHER</p>
                    <div className="grid lg:grid-cols-[0.9fr_1.1fr] items-center gap-12">
                        <div className={motionStyles.intro}>
                            <h1 className="leading-[1.12] text-[clamp(3.25rem,6.3vw,6.5rem)]">
                                {copy.headline[0]}
                                <br />
                                {copy.headline[1]}
                                <br />
                                <span className="text-muted-foreground">{copy.headline[2]}</span>
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
                                <Button asChild size="lg" variant="outline">
                                    <a href="#lx-capabilities">
                                        {copy.explore}
                                        <ArrowRight />
                                    </a>
                                </Button>
                            </div>
                            <p className="m-kicker mt-8">WINDOWS / MACOS / LINUX</p>
                        </div>
                        <div
                            className="min-w-0"
                            role="region"
                            aria-roledescription={t("home.carouselRole")}
                            aria-label="LauncherX"
                            {...carousel.focusHandlers}>
                            <figure id="lx-preview" className={showcase.frame} {...carousel.hoverHandlers}>
                                <div className={showcase.media}>
                                    <PreviewSwap id={preview.image}>
                                        <Image
                                            src={`/assets/lx/LauncherX_${preview.image}.webp`}
                                            alt={preview.caption}
                                            width={1280}
                                            height={720}
                                            sizes="(max-width: 1023px) 100vw, 55vw"
                                            fetchPriority="high"
                                            loading="eager"
                                            className="aspect-video w-full object-contain"
                                        />
                                    </PreviewSwap>
                                </div>
                                <figcaption
                                    className={`flex justify-between gap-4 p-4 ${showcase.caption}`}
                                    aria-live={carousel.live}>
                                    <span className="m-kicker">{preview.caption}</span>
                                    <span className="m-kicker">0{activePreview + 1} / 04</span>
                                </figcaption>
                            </figure>
                            <div
                                className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3"
                                role="group"
                                aria-label="LauncherX">
                                {previews.map((item, index) => (
                                    <button
                                        key={item.image}
                                        type="button"
                                        onClick={() => carousel.select(index)}
                                        aria-pressed={activePreview === index}
                                        aria-controls="lx-preview"
                                        className={`${motionStyles.button} min-w-0 border text-left transition-colors hover:border-primary ${activePreview === index ? "border-primary bg-accent" : "border-border bg-card"}`}>
                                        <Image
                                            src={`/assets/lx/LauncherX_${item.image}.webp`}
                                            alt=""
                                            width={320}
                                            height={180}
                                            sizes="(max-width: 639px) 45vw, (max-width: 1023px) 22vw, 14vw"
                                            className="aspect-video w-full object-contain"
                                        />
                                        <span className="block px-2 py-3 text-xs leading-5">{item.caption}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center justify-between gap-4 mt-4">
                                <p className="m-kicker">{copy.hint}</p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={t(carousel.paused ? "home.resumeCarousel" : "home.pauseCarousel")}
                                    onClick={carousel.togglePlayback}>
                                    {carousel.paused ? <Play size={14} /> : <Pause size={14} />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section id="lx-capabilities" className="m-section scroll-mt-24">
                <div className="m-container">
                    <SectionHeading code="01 / CAPABILITIES" title={copy.capabilities} description={copy.intro} />
                    <div className="m-grid">
                        {features.map((feature, index) => (
                            <ScrollReveal asChild key={feature.label} index={index % 3}>
                                <article>
                                    <div className="m-rule m-kicker">
                                        <span>0{index + 1}</span>
                                        <span>{feature.label}</span>
                                    </div>
                                    <h3 className="text-2xl">{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </article>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
            {copy.stories.map((story, index) => (
                <section className="m-section" key={storyCodes[index]}>
                    <div className="m-container grid lg:grid-cols-[0.9fr_1.1fr] items-start gap-12 lg:gap-20">
                        <div className={`lg:sticky lg:top-28 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                            <SectionHeading
                                code={storyCodes[index]}
                                title={<span className="whitespace-pre-line">{story.title}</span>}
                                description={story.description}
                            />
                            <ScrollReveal asChild>
                                <p className="text-muted-foreground leading-8 border-t border-border pt-6">
                                    {story.detail}
                                </p>
                            </ScrollReveal>
                        </div>
                        <div className="grid gap-5 min-w-0">
                            {storyImages[index].map((image, i) => (
                                <div key={image}>{screenshot(image, story.captions[i])}</div>
                            ))}
                        </div>
                    </div>
                </section>
            ))}
            <section className="m-section">
                <div className="m-container grid md:grid-cols-2 gap-12">
                    <SectionHeading
                        code="05 / PERFORMANCE"
                        title={t("aggressiveOptimizing")}
                        description={t("aggressiveOptimizingDescription")}
                    />
                    <div>
                        <SectionHeading
                            code="RESOURCE PARTNERS"
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
            <section className="m-section">
                <div className="m-container">
                    <SectionHeading
                        code="06 / GET STARTED"
                        title={<span className="whitespace-pre-line">{copy.workflowTitle}</span>}
                    />
                    <div className="m-grid">
                        {copy.steps.map((step, index) => (
                            <ScrollReveal asChild key={index} index={index}>
                                <article>
                                    <div className="m-rule m-kicker">STEP / 0{index + 1}</div>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </article>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
            <section className="m-section bg-primary text-primary-foreground">
                <ScrollReveal asChild>
                    <div className="m-container">
                        <p className="m-kicker text-current mb-6">07 / CONTINUOUS DEVELOPMENT</p>
                        <h2>{t("alwaysGetLatestUpdates")}</h2>
                        <p className="my-6 max-w-2xl leading-8">{t("alwaysGetLatestUpdatesDescription")}</p>
                        <Button asChild variant="outline" className="bg-transparent border-current text-current">
                            <Link href="/lx/download">
                                {t("downloadNow")}
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </ScrollReveal>
            </section>
        </>
    );
}
