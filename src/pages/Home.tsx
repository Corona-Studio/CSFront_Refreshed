import { lazy, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { BookOpenIcon, CatIcon, CoordinateSystemIcon, RocketIcon, TreeSquareDotIcon } from "tdesign-icons-react";
import { Col, Row } from "tdesign-react";

import { useMutationObserver } from "../helpers/MutationObserverHelper.ts";
import i18next from "../i18n";

const Squares = lazy(() => import("../ReactBits/Backgrounds/Squares/Squares.tsx"));
const DecryptedText = lazy(() => import("../ReactBits/TextAnimations/DecryptedText/DecryptedText.tsx"));
const RotatingText = lazy(() => import("../ReactBits/TextAnimations/RotatingText/RotatingText.tsx"));
const BannerContainer = lazy(() => import("../components/BannerContainer.tsx"));
const ProjectCard = lazy(() => import("../components/ProjectCard.tsx"));
const GridMotion = lazy(() => import("../ReactBits/Backgrounds/GridMotion/GridMotion.tsx"));

const t = i18next.t;

function Home() {
    const docRef = useRef(document.documentElement);
    const [gradientColor, setGradientColor] = useState("lightgrey");
    const images = Array(23)
        .fill(1)
        .map((x, y) => x + y)
        .map((x) => new URL(`../assets/landscapes/${x}.webp`, import.meta.url).href);

    const projectsArray = [
        {
            icon: <RocketIcon />,
            title: "LauncherX",
            description: t("lxDescription"),
            link: "/lx"
        },
        {
            icon: <CatIcon />,
            title: "ProjBobcat",
            description: t("projbobcatDescription"),
            link: "https://github.com/Corona-Studio/ProjBobcat"
        },
        {
            icon: <TreeSquareDotIcon />,
            title: "ConnectX",
            description: t("connectxDescription"),
            link: "https://github.com/Corona-Studio/ConnectX"
        },
        {
            icon: <BookOpenIcon />,
            title: "CSKB",
            description: t("cskbDescription"),
            link: "https://kb.corona.studio/"
        },
        {
            icon: <CoordinateSystemIcon />,
            title: "Hive.Framework",
            description: t("hiveDescription"),
            link: "https://github.com/Corona-Studio/Hive.Framework"
        }
    ];

    function onThemeModeChanged(mutations: MutationRecord[]) {
        for (const mutation of mutations) {
            if (mutation.attributeName !== "theme-mode") continue;

            const value = docRef.current.getAttribute("theme-mode");
            const color = value === "dark" ? "DimGrey" : "LightGrey";

            setGradientColor(color);
        }
    }

    useMutationObserver(docRef, onThemeModeChanged, { attributes: true, attributeFilter: ["theme-mode"] });

    return (
        <>
            <Helmet>
                <title>{t("indexPage")} - Corona Studio</title>
                <meta
                    name="description"
                    content="欢迎访问 Corona Studio，我们是一个由 Minecraft 爱好者组建的开发团队。"
                />
            </Helmet>

            <BannerContainer innerDivClassName="dark:bg-black">
                <div className="z-0 w-full h-full shadow">
                    <Squares direction="diagonal" speed={0.1} squareSize={120} hoverFillColor="#ffb300" />
                </div>

                <div className="z-10 absolute w-full h-full" style={{ pointerEvents: "none" }}>
                    <div className="flex absolute left-1/8 h-screen transition">
                        <div className="m-auto space-y-4">
                            <h3>{t("welcomeAccess")}</h3>
                            <div>
                                <DecryptedText
                                    className="dark:text-white text-6xl font-bold"
                                    encryptedClassName="dark:text-white text-6xl font-bold"
                                    sequential={true}
                                    text="Corona Studio"
                                    useOriginalCharsOnly={true}
                                    animateOn="view"
                                    revealDirection="start"
                                />
                            </div>
                            <DecryptedText
                                className="dark:text-white text-6xl font-bold"
                                encryptedClassName="dark:text-white text-6xl font-bold"
                                sequential={true}
                                text={t("corona_studio")}
                                useOriginalCharsOnly={false}
                                animateOn="view"
                                revealDirection="start"
                            />
                            <div className="space-x-4 flex flex-wrap gap-y-4 items-center">
                                <span className="text-4xl whitespace-nowrap">{t("weDevelop")}</span>
                                <div className="min-w-[12rem]">
                                    <RotatingText
                                        texts={["LauncherX", "🐱", "ConnectX", "P2P", "CMFS"]}
                                        mainClassName="text-4xl px-3 bg-amber-400 text-black overflow-hidden py-2 rounded-lg"
                                        staggerFrom={"last"}
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        exit={{ y: "-120%" }}
                                        staggerDuration={0.025}
                                        splitLevelClassName="overflow-hidden"
                                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                        rotationInterval={2000}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </BannerContainer>
            <div className="w-full shadow h-[.5px] -translate-y-[.5px]"></div>

            <div className="dark:bg-black w-full">
                <div className="p-[12.5%] w-full">
                    <div>
                        <h2 className="font-bold pb-4">{t("whoWeAre")}</h2>
                        <span>{t("whoWeAreDetail")}</span>
                    </div>
                </div>

                <div className="h-[30rem]">
                    <GridMotion items={images} gradientColor={gradientColor} />
                </div>

                <div className="p-[12.5%] w-full">
                    <div className="m-auto">
                        <h2 className="font-bold pb-8 float-end">{t("ourProjects")}</h2>
                        <Row gutter={[16, 16]} className="w-full">
                            {projectsArray.map((project, i) => (
                                <Col sm={12} md={6} lg={4} xl={4} key={i}>
                                    <a href={project.link} target="_blank">
                                        <ProjectCard
                                            icon={project.icon}
                                            title={project.title}
                                            description={project.description}
                                        />
                                    </a>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;
