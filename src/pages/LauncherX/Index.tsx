import BannerContainer from "../../components/BannerContainer.tsx";
import InfiniteScroll from "../../ReactBits/Components/InfiniteScroll/InfiniteScroll.tsx";
import styles from "./Index.module.css";

function Index() {
    const items = [
        {
            content: <img src={new URL("../../assets/lx/LauncherX_1.webp", import.meta.url).href} />
        },
        {
            content: <img src={new URL("../../assets/lx/LauncherX_3.webp", import.meta.url).href} />
        },
        {
            content: <img src={new URL("../../assets/lx/LauncherX_5.webp", import.meta.url).href} />
        },
        {
            content: <img src={new URL("../../assets/lx/LauncherX_7.webp", import.meta.url).href} />
        },
        {
            content: <img src={new URL("../../assets/lx/LauncherX_9.webp", import.meta.url).href} />
        },
        {
            content: (
                <img src={new URL("../../assets/lx/LauncherX_11.webp", import.meta.url).href} />
            )
        },
        {
            content: (
                <img src={new URL("../../assets/lx/LauncherX_13.webp", import.meta.url).href} />
            )
        }
    ];

    return (
        <>
            <BannerContainer innerDivClassName="bg-black overflow-clip">
                <div className="z-0 w-full h-full">
                    <div className={styles.darkText}>
                        <div className="lg:pl-[30%]">
                            <InfiniteScroll
                                items={items}
                                isTilted={true}
                                tiltDirection="right"
                                autoplay={true}
                                autoplaySpeed={0.1}
                                autoplayDirection="down"
                                pauseOnHover={true}
                            />
                        </div>
                    </div>
                </div>

                <div className="z-10 absolute w-full h-full" style={{ pointerEvents: "none" }}>
                    <div className={styles.maskRadial}></div>

                    <div className="flex absolute left-1/8 h-screen transition">
                        <div className="m-auto space-y-4">
                            <div>
                                <h1 className="font-bold text-white">
                                    Launcher
                                    <span className={styles.x}>X</span>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
            </BannerContainer>
        </>
    );
}

export default Index;
