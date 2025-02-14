import MenuBar from "../components/MenuBar.tsx";
import Squares from "../ReactBits/Backgrounds/Squares/Squares.tsx";
import RotatingText from "../ReactBits/TextAnimations/RotatingText/RotatingText.tsx";
import DecryptedText from "../ReactBits/TextAnimations/DecryptedText/DecryptedText.tsx";
import i18next from "../i18n";

function Index() {
    return (
        <>
            <MenuBar />
            <div className="flex h-screen relative overflow-x-hidden items-center">
                <div className="w-full h-screen max-h-screen overflow-hidden">
                    <div className="flex bg-white dark:bg-black w-full h-full">
                        <div className="z-0 w-full h-full">
                            <Squares
                                direction="diagonal"
                                speed={0.1}
                                squareSize={120}
                                hoverFillColor="#ffb300"
                            />
                        </div>

                        <div
                            className="z-10 absolute w-full h-full"
                            style={{ pointerEvents: "none" }}>
                            <div className="flex absolute left-1/8 h-screen transition">
                                <div className="m-auto space-y-4">
                                    <h1 className="text-4xl dark:text-white">
                                        {i18next.t("welcomeAccess")}
                                    </h1>
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
                                        <span className="text-4xl dark:text-white align-middle inline-block">
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
                    </div>
                </div>
            </div>
        </>
    );
}

export default Index;
