"use client";

import { ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Button } from "./ui/button";
import { useCarousel } from "./use-carousel";
import styles from "./HomeIntroCarousel.module.css";

const slides = [
    { name: "LauncherX", description: "featureDescription", action: "download", href: "/lx/download" },
    {
        name: "ProjBobcat",
        description: "buildDescription",
        action: "viewBobcat",
        href: "https://github.com/Corona-Studio/ProjBobcat"
    },
    {
        name: "ConnectX",
        description: "connectDescription",
        action: "viewConnect",
        href: "https://github.com/Corona-Studio/ConnectX"
    }
] as const;

export default function HomeIntroCarousel() {
    const { t } = useTranslation();
    const carousel = useCarousel(slides.length);
    const { active, paused } = carousel;

    return (
        <div
            role="region"
            aria-roledescription={t("home.carouselRole")}
            aria-label={t("home.carouselLabel")}
            {...carousel.focusHandlers}>
            <div className={styles.viewport} aria-live={carousel.live} {...carousel.hoverHandlers}>
                {slides.map((slide, index) => {
                    const selected = index === active;
                    const external = slide.href.startsWith("https");
                    return (
                        <div
                            key={slide.name}
                            className={styles.slide}
                            data-active={selected}
                            aria-hidden={!selected}
                            inert={!selected}>
                            <p className="text-foreground leading-7">
                                {t("weDevelop")} {slide.name}
                                <br />
                                {t(`home.${slide.description}`)}
                            </p>
                            <div className={`m-actions ${styles.actions}`}>
                                <Button asChild size="lg">
                                    <Link
                                        href={slide.href}
                                        target={external ? "_blank" : undefined}
                                        rel={external ? "noopener noreferrer" : undefined}>
                                        {t(`home.${slide.action}`)}
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
                    );
                })}
            </div>
            <div className={styles.controls}>
                {slides.map((slide, index) => (
                    <button
                        key={slide.name}
                        type="button"
                        className={styles.selector}
                        aria-label={t("home.showIntro", { project: slide.name })}
                        aria-pressed={active === index}
                        onClick={() => carousel.select(index)}>
                        <span aria-hidden="true" />
                        {slide.name}
                    </button>
                ))}
                <button
                    type="button"
                    className={styles.playback}
                    aria-label={t(paused ? "home.resumeCarousel" : "home.pauseCarousel")}
                    onClick={carousel.togglePlayback}>
                    {paused ? <Play size={14} /> : <Pause size={14} />}
                </button>
            </div>
        </div>
    );
}
