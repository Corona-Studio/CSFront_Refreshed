import i18next from "i18next";
import { lazy } from "react";
import { Helmet } from "react-helmet-async";
import { Button, Timeline } from "tdesign-react";

import styles from "./CMFS.module.css";
import { JumpIcon } from "tdesign-icons-react";

const FlowingMenu = lazy(() => import("../ReactBits/Components/FlowingMenu/FlowingMenu.tsx"));
const Masonry = lazy(() => import("../ReactBits/Components/Masonry/Masonry.tsx"));
const BannerContainer = lazy(() => import("../components/BannerContainer.tsx"));

const t = i18next.t;

function CMFS() {
    const heights = [600, 700, 800, 900];
    const images = Array(20)
        .fill(1)
        .map((x, y) => x + y)
        .map((x, i) => ({
            id: i,
            image: new URL(`../assets/landscapes/${x}.webp`, import.meta.url).href,
            height: heights[Math.floor(Math.random() * heights.length)] // eslint-disable-line
        }))
        .map((value) => ({ value, sort: Math.random() })) // eslint-disable-line
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    const serverListItems = [
        { link: "https://craftmine.fun/cmfs/pure/survival", text: "pure.craftmine.fun", image: new URL(`../assets/landscapes/1.webp`, import.meta.url).href },
        // { link: "https://craftmine.fun/cmfs/pure/survival", text: "pure.cmfs.kami.su 纯净生存国际解析", image: new URL(`../assets/landscapes/5.webp`, import.meta.url).href },
        { link: "https://craftmine.fun/cmfs/pure/radost", text: "pure.craftmine.fun 小游戏", image: new URL(`../assets/landscapes/10.webp`, import.meta.url).href },
        { link: "https://craftmine.fun/cmfs/mood/lappland", text: "lapp.cmfs.kami.su", image: new URL(`../assets/landscapes/15.webp`, import.meta.url).href }
    ];

    const timeline = Array(9)
        .fill(1)
        .map((x, y) => x + y)
        .map((x, i) => ({
            year: 2016 + i,
            title: t(`event${x}`),
            detail: t(`event${x}Description`)
        }));

    return (
        <>
            <Helmet>
                <title>{t("serverList")} - Corona Studio</title>
                <meta name="description" content={t("beginningOfEverythingDescription1")} />
            </Helmet>

            <div className="dark:bg-black">
                <BannerContainer>
                    <div className={styles.masonry}>
                        <Masonry data={images} />
                    </div>

                    <div className={styles.midBlurBg} style={{ pointerEvents: "none" }}></div>

                    <div className="z-10 absolute w-full h-full grid place-items-center">
                        <div className="grid items-center justify-items-center">
                            <img
                                src={new URL(`../assets/cmfs.png`, import.meta.url).href}
                                alt="CMFS"
                                loading="lazy"
                                width={200}
                            />

                            <Button size="large" onClick={() => window.scrollTo({ top: document.getElementById("srvlst")!.offsetTop, behavior: "smooth" })} className="my-5! block " shape="round" >
                                {t("joinServer")}
                            </Button>

                            <Button title="将会跳转到CMF首页 | It leads you to the homepage of CMF" href="https://craftmine.fun" target="_blank" variant="text" className="border-0! text-shadow-md text-shadow-white/30 pt-1! hover:border-b-4! block! transition active:border-b-2! hover:bg-zinc-500/50! border-b-amber-50! rounded-none!" shape="round" >
                                了解更多 <JumpIcon className="ml-1 translate-y-1" />
                            </Button>
                        </div>
                    </div>
                </BannerContainer>

                <div className="w-full text-white">
                    <div className="py-[12.5%] w-full bg-gray-900">
                        <h2 id="srvlst" className="px-[12.5%] pb-3 font-bold">{t("serverList")}</h2>
                        <p className="px-[12.5%] pb-[6%] text-lg">点击跳转到服务器详细信息显示页面。</p>
                        <div style={{ height: "600px", position: "relative" }}>
                            <FlowingMenu items={serverListItems} />
                        </div>
                    </div>
                </div>

                <div className="w-full p-[12.5%] dark:bg-zinc-500">
                    <div className="w-full">
                        <h2>{t("beginningOfEverything")}</h2>
                        <h5 className="pt-4">{t("beginningOfEverythingDescription1")}</h5>
                        <h5 className="pt-4">{t("beginningOfEverythingDescription2")}</h5>

                        <div className="pt-4">
                            <Timeline layout="vertical" labelAlign="alternate" mode="alternate">
                                {timeline.map((item, i) => (
                                    <Timeline.Item key={i} label={item.year}>
                                        <div className="m-auto">
                                            <h5>{item.title}</h5>
                                            <span>{item.detail}</span>
                                        </div>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CMFS;
