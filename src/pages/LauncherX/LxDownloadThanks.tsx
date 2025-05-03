import i18next from "i18next";
import { lazy, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { CheckCircleFilledIcon, LinkIcon } from "tdesign-icons-react";
import { Alert, Button, Card, Divider } from "tdesign-react";

import { envVal } from "../../helpers/EnvHelper.ts";

const Waves = lazy(() => import("../../ReactBits/Backgrounds/Waves/Waves.tsx"));
const BannerContainer = lazy(() => import("../../components/BannerContainer.tsx"));

const t = i18next.t;

interface GuideLink {
    os: string;
    title: string;
    url: string;
    icon?: string;
}

function LxDownloadThanks() {
    const [detectedOS, setDetectedOS] = useState<string | null>(() => {
        return sessionStorage.getItem("detectedOS");
    });

    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        setShowAnimation(true);

        if (!detectedOS) {
            const platform = navigator.userAgent.toLowerCase();
            let os = null;

            if (platform.includes("win")) {
                os = "Windows";
            } else if (platform.includes("mac")) {
                os = "macOS";
            } else if (platform.includes("linux")) {
                os = "Linux";
            }

            if (os) {
                sessionStorage.setItem("detectedOS", os);
                setDetectedOS(os);
            }
        }
    }, [detectedOS]);

    const guideLinks: GuideLink[] = useMemo(
        () => [
            {
                os: "Windows",
                title: t("windowsSetupGuide"),
                url: "https://kb.corona.studio/zhCN/lxguide/startup/perOsSetup/windows.html",
                icon: "🪟"
            },
            {
                os: "macOS",
                title: t("macosSetupGuide"),
                url: "https://kb.corona.studio/zhCN/lxguide/startup/perOsSetup/macOS.html",
                icon: "🍎"
            },
            {
                os: "Linux",
                title: t("linuxSetupGuide"),
                url: "https://kb.corona.studio/zhCN/lxguide/startup/perOsSetup/linux.html",
                icon: "🐧"
            }
        ],
        []
    );

    const recommendedGuide = useMemo(() => {
        const guide = guideLinks.find((link) => link.os === detectedOS);
        return guide;
    }, [detectedOS, guideLinks]);

    return (
        <>
            <Helmet>
                <title>{t("downloadThanks")} - LauncherX</title>
                <meta name="description" content={t("downloadThanksDescription")} />
            </Helmet>

            <BannerContainer>
                <div className="fixed inset-0 z-0">
                    <Waves
                        lineColor={envVal("oklch(50% 0.15 200)", "#6c4b00")}
                        waveSpeedX={envVal(0, 0.015)}
                        waveSpeedY={envVal(0, 0.008)}
                        waveAmpX={envVal(0, 35)}
                        waveAmpY={envVal(0, 15)}
                        friction={envVal(0, 0.92)}
                        tension={envVal(0, 0.015)}
                        maxCursorMove={envVal(0, 100)}
                        xGap={envVal(20, 15)}
                        yGap={envVal(20, 40)}
                        slantFactor={0.4}
                        lineOpacity={envVal(0.3, 0.5)}
                    />
                </div>
                <div className="relative z-10 w-full h-full grid place-items-center">
                    <div
                        className={`text-center text-gray-900 dark:text-white space-y-6 transition-all duration-500 ${showAnimation ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-10"}`}>
                        <div className="mt-20 mb-6 flex justify-center">
                            <CheckCircleFilledIcon className="text-green-500 text-6xl" />
                        </div>
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            {t("downloadThanks")}
                        </h1>
                        <p className="text-xl max-w-2xl mx-auto text-gray-700 dark:text-gray-300">
                            {t("downloadThanksFollowGuide")}
                        </p>

                        <Divider className="my-8 border-gray-300 dark:border-gray-700" />

                        <div className="pt-8 px-[5%] md:px-[10%] lg:px-[15%] w-full">
                            <h2 className="font-bold mb-8 text-center text-2xl text-gray-900 dark:text-white">
                                {t("setupGuides")}
                            </h2>

                            {recommendedGuide && (
                                <div className="max-w-7xl mx-auto w-full mb-10">
                                    <Alert
                                        theme="info"
                                        title={t("recommendedGuide")}
                                        message={
                                            <span className="text-base text-gray-800 dark:text-gray-200">
                                                {t("basedOnYourSystem")}{" "}
                                                <strong className="text-blue-600 dark:text-blue-400">
                                                    {detectedOS}
                                                </strong>
                                                , {t("weRecommendReading")}{" "}
                                                <a
                                                    href={recommendedGuide.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 dark:text-blue-500 hover:underline font-medium">
                                                    {recommendedGuide.title}
                                                </a>
                                                .
                                            </span>
                                        }
                                        className="text-left shadow-lg bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto items-stretch">
                                {guideLinks.map((guide, index) => (
                                    <div key={guide.os} className="w-full h-full group">
                                        <Card
                                            bordered
                                            hoverShadow
                                            className={`bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm transition-all duration-300 ease-out transform h-full 
                                                group-hover:-translate-y-2 group-hover:scale-[1.03] group-hover:shadow-[0_20px_25px_-5px_rgba(59,130,246,0.1)]
                                                ${
                                                    guide.os === detectedOS
                                                        ? "border-2 border-blue-500 shadow-lg shadow-blue-500/20"
                                                        : "border border-gray-200 dark:border-zinc-700 hover:border-blue-400/50"
                                                }`}
                                            style={{
                                                animationDelay: `${index * 150}ms`,
                                                animation: showAnimation ? "fadeInUp 0.6s ease forwards" : "none"
                                            }}>
                                            <div className="flex flex-col items-center text-center text-gray-900 dark:text-white p-4 h-full">
                                                <div className="text-4xl mb-3 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-[360deg]">
                                                    {guide.icon}
                                                </div>
                                                <h3 className="text-xl font-semibold mb-2 transition-colors duration-300 text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                    {guide.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-grow transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                                                    {t("guideFor")} {guide.os}
                                                </p>
                                                <Button
                                                    theme="primary"
                                                    variant={guide.os === detectedOS ? "base" : "outline"}
                                                    href={guide.url}
                                                    target="_blank"
                                                    icon={
                                                        <LinkIcon className="transition-transform duration-300 group-hover:rotate-45" />
                                                    }
                                                    className="w-full mt-auto transition-transform duration-300 group-hover:scale-105">
                                                    {t("viewGuide")}
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </BannerContainer>
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
}

export const Component = () => LxDownloadThanks();
