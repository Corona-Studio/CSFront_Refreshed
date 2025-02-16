import i18next from "i18next";
import { lazy } from "react";
import { useNavigate } from "react-router";
import { ArrowRightIcon } from "tdesign-icons-react";
import { Button, Col, Row, Statistic } from "tdesign-react";

import styles from "./Index.module.css";

const LetterGlitch = lazy(() => import("../../ReactBits/Backgrounds/LetterGlitch/LetterGlitch.tsx"));
const BounceCards = lazy(() => import("../../ReactBits/Components/BounceCards/BounceCards.tsx"));
const InfiniteScroll = lazy(() => import("../../ReactBits/Components/InfiniteScroll/InfiniteScroll.tsx"));
const RollingGallery = lazy(() => import("../../ReactBits/Components/RollingGallery/RollingGallery.tsx"));
const RotatingText = lazy(() => import("../../ReactBits/TextAnimations/RotatingText/RotatingText.tsx"));
const BannerContainer = lazy(() => import("../../components/BannerContainer.tsx"));
const LxLogo = lazy(() => import("../../components/LxLogo.tsx"));

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
                    width="500"
                    key={i}
                    src={new URL(`../../assets/lx/LauncherX_${x}.webp`, import.meta.url).href}
                    alt="LauncherX"
                />
            )
        }));

    const launcherImages = Array(13)
        .fill(1)
        .map((x, y) => x + y)
        .filter((x) => x % 2 !== 0)
        .map((x) => new URL(`../../assets/lx/LauncherX_${x}.webp`, import.meta.url).href);

    const usages = [
        t("modPackInstallation"),
        t("resourceDownload"),
        t("versionManagement"),
        t("serverManagement"),
        t("modPackManagement"),
        t("accountManagement")
    ];

    const thirdpartyLogo = [
        new URL("../../assets/thirdparty/CurseForge.jpg", import.meta.url).href,
        new URL("../../assets/thirdparty/Forge.jpg", import.meta.url).href,
        new URL("../../assets/thirdparty/Modrinth.png", import.meta.url).href
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
            <div className="bg-black">
                <BannerContainer innerDivClassName="overflow-clip">
                    <div className="z-0 w-full h-full">
                        <InfiniteScroll
                            width="40rem"
                            items={items}
                            isTilted={true}
                            tiltDirection="right"
                            autoplay={true}
                            autoplaySpeed={0.1}
                            autoplayDirection="down"
                            pauseOnHover={true}
                        />
                    </div>

                    <div className="z-10 absolute w-full h-full">
                        <div className={styles.maskRadial} />

                        <div className="flex absolute left-1/8 h-screen transition">
                            <div className="m-auto space-y-4">
                                <div className="text-white">
                                    <LxLogo />
                                    <span>{t("lxSlogan")}</span>
                                </div>
                                <Button size="large" variant="base" onClick={() => navigate("/lx/download")}>
                                    <div className="flex items-center space-x-4">
                                        <span>{t("downloadNow")}</span>
                                        <ArrowRightIcon />
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                </BannerContainer>

                <div className="w-full text-white">
                    <div className="p-[12.5%] w-full bg-gray-900">
                        <Row className="items-center" align="middle">
                            <Col xs={12} lg={6}>
                                <div className="text-white">
                                    <div className="m-auto space-y-4">
                                        <h2 className="font-bold">{t("powerfulFeatures")}</h2>
                                        <div className="flex items-center space-x-6">
                                            <h3>{t("notOnly")}</h3>
                                            <RotatingText
                                                texts={usages}
                                                mainClassName="text-xl px-2 sm:px-2 md:px-3 bg-amber-400 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 rounded-lg"
                                                staggerFrom={"last"}
                                                initial={{ y: "100%" }}
                                                animate={{ y: 0 }}
                                                exit={{ y: "-120%" }}
                                                staggerDuration={0.025}
                                                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                                                rotationInterval={2000}
                                            />
                                        </div>
                                        <div className="pt-4">{t("powerfulFeaturesDescription")}</div>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} lg={6}>
                                <RollingGallery autoplay={true} pauseOnHover={true} images={launcherImages} />
                            </Col>
                        </Row>
                    </div>

                    <div className="p-[12.5%] w-full bg-black">
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

                    <div className="p-[12.5%] w-full bg-gray-900">
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

                    <div className="p-[12.5%] w-full bg-black">
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
