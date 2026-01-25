import i18next from "i18next";
import { lazy } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router";
import { ArrowRightIcon } from "tdesign-icons-react";
import { Button, Col, Row, Statistic } from "tdesign-react";

import MagicBento, { BentoCardProps } from "../../ReactBits/Components/MagicBento/MagicBento.tsx";
import styles from "./LxHome.module.css";

const LetterGlitch = lazy(() => import("../../ReactBits/Backgrounds/LetterGlitch/LetterGlitch.tsx"));
const BounceCards = lazy(() => import("../../ReactBits/Components/BounceCards/BounceCards.tsx"));
const InfiniteScroll = lazy(() => import("../../ReactBits/Components/InfiniteScroll/InfiniteScroll.tsx"));
const RollingGallery = lazy(() => import("../../ReactBits/Components/RollingGallery/RollingGallery.tsx"));
const RotatingText = lazy(() => import("../../ReactBits/TextAnimations/RotatingText/RotatingText.tsx"));
const BannerContainer = lazy(() => import("../../components/BannerContainer.tsx"));
const LxLogo = lazy(() => import("../../components/LxLogo.tsx"));

const launcherImages = Array(13)
    .fill(1)
    .map((x, y) => x + y)
    .filter((x) => x % 2 !== 0)
    .map((x) => new URL(`../../assets/lx/LauncherX_${x}.webp`, import.meta.url).href);

const cardData: BentoCardProps[] = [
    {
        bgImage: "#fecaca",
        bgStyle: {
            opacity: 0,
            transform: "scale(300%)",
            top: 3
        },
        title: "ConnectX",
        description: "多人游戏更便利",
        label: "P2P/中继双模"
    },
    {
        bgImage: "#05050555",
        bgStyle: { opacity: 0 },
        title: "跨平台",
        description: "Linux/Windows/macOS 几乎一致的体验",
        label: "x64+ARM64"
    },
    {
        bgImage: "#39c5bb1f",
        bgStyle: { opacity: 0 },
        title: "整合包",
        description: "主流平台整合包导入导出和资源安装支持",
        label: "Curseforge/Modrinth"
    },
    {
        bgImage: "#33229955",
        bgStyle: { opacity: 0 },
        title: "ProjBobcat",
        description: "自研启动核心",
        label: "安全 稳定 开源"
    },
    {
        bgImage: "#11451419",
        bgStyle: { opacity: 0 },
        title: "简洁美观",
        description: "即便放在桌面也是件艺术品",
        label: "极简外观 暗藏玄机"
    },
    {
        bgImage: "#19810033",
        bgStyle: { opacity: 0 },
        title: "多线下载",
        description: "最大化利用上下游带宽以高速下载",
        label: "高效便捷"
    }
];

const t = i18next.t;

function LxHome() {
    const navigate = useNavigate();

    const items = Array(30)
        .fill(1)
        .map((x, y) => x + y)
        .filter((x) => x % 2 !== 0)
        .map((x, i) => ({
            content: (
                <img
                    loading="lazy"
                    key={i}
                    src={new URL(`../../assets/lx/LauncherX_${x}.webp`, import.meta.url).href}
                    alt="LauncherX"
                />
            )
        }));

    const usages = [
        t("modPackInstallation"),
        t("resourceDownload"),
        t("versionManagement"),
        t("serverManagement"),
        t("modPackManagement"),
        t("accountManagement")
    ];

    const thirdpartyLogo = [
        new URL("../../assets/thirdparty/CurseForge.webp", import.meta.url).href,
        new URL("../../assets/thirdparty/Forge.webp", import.meta.url).href,
        new URL("../../assets/thirdparty/Modrinth.webp", import.meta.url).href
    ];

    const transformStyles = [
        "rotate(5deg) translate(-150px)",
        "rotate(0deg) translate(-70px)",
        "rotate(-5deg)",
        "rotate(5deg) translate(70px)",
        "rotate(-5deg) translate(150px)"
    ];

    return (
        <>
            <Helmet>
                <title>{t("downloadNow")} - LauncherX</title>
                <meta name="description" content={t("lxDescription")} />
            </Helmet>

            <div className="bg-black">
                <BannerContainer innerDivClassName="overflow-clip">
                    <div className="z-0 w-full h-full">
                        <InfiniteScroll
                            width="50rem"
                            items={items}
                            isTilted={true}
                            tiltDirection="right"
                            autoplay={true}
                            autoplaySpeed={0.1}
                            autoplayDirection="down"
                            pauseOnHover={true}
                            negativeMargin="4rem"
                        />
                    </div>

                    <div className="z-10 absolute w-full h-full">
                        <div className={styles.maskRadial} />

                        <div className="flex absolute md:left-1/8 h-screen transition px-5">
                            <div className="m-auto space-y-4">
                                <div className="text-white">
                                    <LxLogo />
                                    <span>{t("lxSlogan")}</span>
                                </div>
                                <div className="">
                                    <Button size="large" variant="base" onClick={() => navigate("/lx/download")}>
                                        <div className="flex items-center space-x-4 ">
                                            <span>{t("downloadNow")}</span>
                                            <ArrowRightIcon />
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </BannerContainer>

                <div className="w-full py-20 px-[12.5%]">
                    <h2 className="font-bold">{t("talkIsCheap")}</h2>
                    <MagicBento
                        cardData={cardData}
                        textAutoHide={true}
                        enableStars={true}
                        enableSpotlight={true}
                        enableBorderGlow={true}
                        clickEffect={true}
                        spotlightRadius={300}
                        particleCount={12}
                        glowColor="255, 185, 0"
                    />
                </div>
                <div className="w-full text-white">
                    <div className=" py-24 w-full bg-gray-900 px-0 xl:px-[12.5%] grid grid-cols-1 xl:grid-cols-2 gap-2">
                        <div className="w-full px-[12.5%] xl:px-0 ">
                            <div className="m-auto space-y-4 text-white">
                                <h2 className="font-bold m-0!">{t("powerfulFeatures")}</h2>
                                <div className="flex flex-wrap items-center justify-start! justify-items-start! space-x-6 mt-3">
                                    <h3 className="inline-block m-0! mr-1!">{t("notOnly")}</h3>
                                    <RotatingText
                                        texts={usages}
                                        mainClassName="text-base lg:text-xl block px-2 lg:px-3 bg-amber-400 text-black overflow-hidden py-1  rounded-lg"
                                        staggerFrom={"last"}
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        exit={{ y: "-120%" }}
                                        staggerDuration={0.025}
                                        splitLevelClassName="overflow-hidden"
                                        rotationInterval={2000}
                                    />
                                </div>
                                <div className="pt-4">{t("powerfulFeaturesDescription")}</div>
                            </div>
                        </div>
                        <div className="w-full">
                            <RollingGallery autoplay={true} pauseOnHover={true} images={launcherImages} />
                        </div>
                    </div>

                    <div className="px-[12.5%] py-24 w-full bg-black">
                        <Row align="middle">
                            <Col xs={12} lg={6}>
                                <div className="text-white pr-24 pb-16">
                                    <div className="m-auto">
                                        <h2 className="font-bold">{t("aggressiveOptimizing")}</h2>
                                        <div className="pt-4">{t("aggressiveOptimizingDescription")}</div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} lg={6}>
                                <LetterGlitch
                                    glitchColors={["#64ce65", "#4085de", "#66b2d3"]}
                                    glitchSpeed={50}
                                    centerVignette={false}
                                    outerVignette={true}
                                    smooth={true}
                                />
                            </Col>
                        </Row>
                    </div>

                    <div className="px-[12.5%] py-24 w-full bg-gray-900">
                        <Row>
                            <Col xs={12} lg={6}>
                                <BounceCards
                                    enableHover={true}
                                    images={thirdpartyLogo}
                                    containerWidth={500}
                                    containerHeight={200}
                                    animationDelay={1}
                                    animationStagger={0.08}
                                    easeType="elastic.out(1, 0.5)"
                                    transformStyles={transformStyles}
                                />
                            </Col>
                            <Col xs={12} lg={6}>
                                <div className="text-white pr-24">
                                    <div className="m-auto items-end">
                                        <h2 className="font-bold text-right">
                                            {t("integratedWithThirdPartyResources")}
                                        </h2>
                                        <div className="pt-4 text-right">
                                            {t("integratedWithThirdPartyResourcesDescription")}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <div className="px-[12.5%] py-24 w-full bg-black">
                        <Row>
                            <Col xs={12} lg={6}>
                                <div className="w-full flex pb-16 space-x-8">
                                    <Statistic
                                        style={{ color: "white" }}
                                        title={t("bugFixRequiredTime")}
                                        value={99}
                                        unit="%"
                                        trend="decrease"
                                        color="green"
                                    />
                                    <Statistic
                                        style={{ color: "white" }}
                                        title={t("updateFrequency")}
                                        value={82.76}
                                        unit="%"
                                        trend="increase"
                                        color="blue"
                                    />
                                    <Statistic
                                        style={{ color: "white" }}
                                        title={t("featureDevelopment")}
                                        value={76}
                                        unit="%"
                                        trend="increase"
                                        color="red"
                                    />
                                    <Statistic
                                        style={{ color: "white" }}
                                        title={t("feedbackResponse")}
                                        value={60}
                                        unit="%"
                                        trend="increase"
                                        color="orange"
                                    />
                                </div>
                            </Col>
                            <Col xs={12} lg={6}>
                                <div className="text-white pr-24">
                                    <div className="m-auto items-end">
                                        <h2 className="font-bold text-right">{t("alwaysGetLatestUpdates")}</h2>
                                        <div className="pt-4 text-right">{t("alwaysGetLatestUpdatesDescription")}</div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LxHome;
