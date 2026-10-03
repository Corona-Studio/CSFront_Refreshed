"use client";

import { ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "./ui/button";
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
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        if (paused || hovered || focused) return;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const timer = window.setInterval(() => {
            if (!document.hidden && !reducedMotion.matches) {
                setActive((index) => (index + 1) % slides.length);
            }
        }, 6000);
        return () => window.clearInterval(timer);
    }, [active, paused, hovered, focused]);

    return (
        <div
            role="region"
            aria-roledescription={t("home.carouselRole")}
            aria-label={t("home.carouselLabel")}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocusCapture={() => setFocused(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
            }}>
            <div className={styles.viewport} aria-live={paused || focused ? "polite" : "off"}>
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
                        onClick={() => setActive(index)}>
                        <span aria-hidden="true" />
                        {slide.name}
                    </button>
                ))}
                <button
                    type="button"
                    className={styles.playback}
                    aria-label={t(paused ? "home.resumeCarousel" : "home.pauseCarousel")}
                    onClick={() => setPaused((value) => !value)}>
                    {paused ? <Play size={14} /> : <Pause size={14} />}
                </button>
            </div>
        </div>
    );
}
