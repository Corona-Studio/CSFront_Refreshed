import MenuBar from "../components/MenuBar.tsx";
import Squares from "../ReactBits/Backgrounds/Squares/Squares.tsx";
import RotatingText from "../ReactBits/TextAnimations/RotatingText/RotatingText.tsx";
import DecryptedText from "../ReactBits/TextAnimations/DecryptedText/DecryptedText.tsx";
import i18next from "../i18n";
import BannerContainer from "../components/BannerContainer.tsx";
import GridMotion from "../ReactBits/Backgrounds/GridMotion/GridMotion.tsx";
import { Col, Row } from "tdesign-react";
import SpotlightCard from "../ReactBits/Components/SpotlightCard/SpotlightCard.tsx";
import { SunnyIcon, MoonIcon, LinkIcon } from "tdesign-icons-react";

function Index() {
    const items1 = Array(25).fill(
        "https://images.unsplash.com/photo-1723403804231-f4e9b515fe9d?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    );

    console.log(items1);

    return (
        <>
            <MenuBar />

            <BannerContainer innerDivClassName="bg-white dark:bg-black">
                <div className="z-0 w-full h-full">
                    <Squares
                        direction="diagonal"
                        speed={0.1}
                        squareSize={120}
                        hoverFillColor="#ffb300"
                    />
                </div>

                <div className="z-10 absolute w-full h-full" style={{ pointerEvents: "none" }}>
                    <div className="flex absolute left-1/8 h-screen transition">
                        <div className="m-auto space-y-4">
                            <h3>{i18next.t("welcomeAccess")}</h3>
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
                                text={i18next.t("corona_studio")}
                                useOriginalCharsOnly={false}
                                animateOn="view"
                                revealDirection="start"
                            />
                            <div className="flex items-center space-x-4">
                                <span className="text-4xl align-middle inline-block">
                                    {i18next.t("weDevelop")}
                                </span>
                                <RotatingText
                                    texts={["LauncherX", "ConnectX", "P2P", "CMFS"]}
                                    mainClassName="text-4xl px-2 sm:px-2 md:px-3 bg-amber-400 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 rounded-lg"
                                    staggerFrom={"last"}
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "-120%" }}
                                    staggerDuration={0.025}
                                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                                    rotationInterval={2000}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </BannerContainer>

            <div className="dark:bg-black w-full">
                <div className="p-[12.5%] w-full">
                    <div>
                        <h2 className="font-bold pb-4">{i18next.t("whoWeAre")}</h2>
                        <span>{i18next.t("whoWeAreDetail")}</span>
                    </div>
                </div>

                <div className="h-[30rem]">
                    <GridMotion items={items1} />
                </div>

                <div className="p-[12.5%] w-full">
                    <div className="m-auto">
                        <h2 className="font-bold pb-8 float-end">{i18next.t("ourProjects")}</h2>
                        <Row gutter={16} className="w-full">
                            <Col span={4}>
                                <SpotlightCard
                                    className="custom-spotlight-card"
                                    spotlightColor="rgba(0, 229, 255, 0.2)">
                                    <div>
                                        <SunnyIcon className="text-4xl" />
                                        <h4 className="pt-4 font-bold">LauncherX</h4>
                                        <p>
                                            aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                                        </p>
                                    </div>
                                </SpotlightCard>
                            </Col>
                            <Col span={4}>
                                <SpotlightCard
                                    className="custom-spotlight-card"
                                    spotlightColor="rgba(0, 229, 255, 0.2)">
                                    <div>
                                        <SunnyIcon className="text-4xl" />
                                        <h4 className="pt-4 font-bold">LauncherX</h4>
                                        <p>
                                            aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                                        </p>
                                    </div>
                                </SpotlightCard>
                            </Col>
                            <Col span={4}>
                                <SpotlightCard
                                    className="custom-spotlight-card"
                                    spotlightColor="rgba(0, 229, 255, 0.2)">
                                    <div>
                                        <SunnyIcon className="text-4xl" />
                                        <h4 className="pt-4 font-bold">LauncherX</h4>
                                        <p>
                                            aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                                        </p>
                                    </div>
                                </SpotlightCard>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Index;
