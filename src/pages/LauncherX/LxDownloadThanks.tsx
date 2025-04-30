import i18next from "i18next";
import { lazy, useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Alert, Button, Card, Row, Divider } from "tdesign-react";
import { LinkIcon, CheckCircleFilledIcon } from "tdesign-icons-react";

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
    
    // 添加动画效果状态
    const [showAnimation, setShowAnimation] = useState(false);
    
    // 组件加载时触发动画
    useEffect(() => {
        setShowAnimation(true);
        
        // 如果没有检测到操作系统，尝试检测
        if (!detectedOS) {
            const platform = navigator.platform.toLowerCase();
            let os = null;
            
            if (platform.includes('win')) {
                os = 'Windows';
            } else if (platform.includes('mac')) {
                os = 'macOS';
            } else if (platform.includes('linux')) {
                os = 'Linux';
            }
            
            if (os) {
                sessionStorage.setItem("detectedOS", os);
                setDetectedOS(os);
            }
        }
    }, [detectedOS]);

    const guideLinks: GuideLink[] = useMemo(() => [
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
    ], []);

    const recommendedGuide = useMemo(() => {
        const guide = guideLinks.find(link => link.os === detectedOS);
        return guide;
    }, [detectedOS, guideLinks]);

    return (
        <>
            <Helmet>
                <title>{t("downloadThanks")} - LauncherX</title>
                <meta name="description" content={t("downloadThanksDescription")} />
            </Helmet>

            <div className="dark:bg-black min-h-screen">
                <BannerContainer innerDivClassName="overflow-clip">
                    <div className="z-0 w-full h-full">
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
                    <div className="z-10 absolute w-full h-full grid place-items-center">
                        <div className={`text-center text-white space-y-6 transition-all duration-700 ${showAnimation ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-10'}`}>
                            <div className="mb-6 flex justify-center">
                                <CheckCircleFilledIcon className="text-green-500 text-6xl" />
                            </div>
                            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                                {t("downloadThanks")}
                            </h1>
                            <p className="text-xl max-w-2xl mx-auto">{t("downloadThanksFollowGuide")}</p>
                            
                            <Divider className="my-8 border-gray-700" />
                            
                            <div className="pt-8 px-[5%] md:px-[10%] lg:px-[15%] w-full">
                                <h2 className="font-bold mb-8 text-center text-2xl dark:text-white">{t("setupGuides")}</h2>

                                {recommendedGuide && (
                                    <Alert
                                        theme="info"
                                        title={t("recommendedGuide")}
                                        message={
                                            <span className="text-base">
                                                {t("basedOnYourSystem")} <strong className="text-blue-400">{detectedOS}</strong>, {t("weRecommendReading")} <a href={recommendedGuide.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">{recommendedGuide.title}</a>.
                                            </span>
                                        }
                                        className="mb-10 text-left shadow-lg"
                                    />
                                )}

                                <div className="h-4"></div>
                                <Row gutter={[24, 24]} className="justify-center">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
                                        {guideLinks.map((guide, index) => (
                                            <div key={guide.os} className="w-full">
                                                <Card
                                                    bordered
                                                    hoverShadow
                                                    className={`dark:bg-zinc-800/80 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${guide.os === detectedOS ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/20' : 'dark:border-zinc-700'}`}
                                                    style={{
                                                        animationDelay: `${index * 150}ms`,
                                                        animation: showAnimation ? 'fadeInUp 0.6s ease forwards' : 'none'
                                                    }}
                                                >
                                                    <div className="flex flex-col items-center text-center dark:text-white p-4">
                                                        <div className="text-4xl mb-3">{guide.icon}</div>
                                                        <h3 className="text-xl font-semibold mb-2">{guide.title}</h3>
                                                        <p className="text-sm text-gray-400 mb-6">{t("guideFor")} {guide.os}</p>
                                                        <Button
                                                            theme="primary"
                                                            variant={guide.os === detectedOS ? "base" : "outline"}
                                                            href={guide.url}
                                                            target="_blank"
                                                            icon={<LinkIcon />}
                                                            className="w-full"
                                                        >
                                                            {t("viewGuide")}
                                                        </Button>
                                                    </div>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                </Row>
                            </div>
                        </div>
                    </div>
                </BannerContainer>
            </div>
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