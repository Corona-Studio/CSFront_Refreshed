import i18next from "i18next";
import { lazy, useEffect, useState } from "react";
import { Button, Dropdown, Loading, NotificationPlugin } from "tdesign-react";
import { DropdownOption } from "tdesign-react/es/dropdown/type";

import { LauncherRawBuildModel, getAllStableBuilds, lxBackendUrl } from "../../requests/LxBuildRequests.ts";

const Waves = lazy(() => import("../../ReactBits/Backgrounds/Waves/Waves.tsx"));
const RotatingText = lazy(() => import("../../ReactBits/TextAnimations/RotatingText/RotatingText.tsx"));
const BannerContainer = lazy(() => import("../../components/BannerContainer.tsx"));
const LxLogo = lazy(() => import("../../components/LxLogo.tsx"));

const t = i18next.t;

function LxDownload() {
    const [isLoading, setIsLoading] = useState<boolean | undefined>(true);
    const [downloadOptions, setDownloadOptions] = useState<DropdownOption[]>([]);

    async function getLauncherBuilds() {
        const builds = await getAllStableBuilds();

        if (!builds) {
            await NotificationPlugin.info({
                title: "获取失败",
                content: "无法获取构建",
                placement: "top-right",
                duration: 10000,
                offset: [-36, "10rem"],
                closeBtn: true,
                attach: () => document
            });

            setIsLoading(undefined);
            return;
        }

        const options: DropdownOption[] = [];

        for (const [key, value] of Object.entries(builds)) {
            const build = value as LauncherRawBuildModel;

            options.push({
                content: key,
                value: `${lxBackendUrl}/Build/get/${build.id}/${build.framework}.${build.runtime}.zip`
            });
        }

        setDownloadOptions(options);
        setIsLoading(false);
    }

    useEffect(() => {
        getLauncherBuilds().then(() => console.log("Build load completed."));
    }, []);

    function onMenuItemClicked(dropdownItem: DropdownOption) {
        if (!dropdownItem.value) return;

        const value = dropdownItem.value as string;

        window.open(value, "_blank");
    }

    return (
        <>
            <div className="bg-black">
                <BannerContainer innerDivClassName="overflow-clip">
                    <div className="z-0 w-full h-full">
                        <Waves
                            lineColor="#6c4b00"
                            waveSpeedX={0.02}
                            waveSpeedY={0.01}
                            waveAmpX={30}
                            waveAmpY={30}
                            friction={0.2}
                            tension={0.1}
                            maxCursorMove={120}
                            xGap={15}
                            yGap={36}
                        />
                    </div>

                    <div className="absolute z-10 w-full h-full text-white flex-center">
                        <div className="place-items-center">
                            <div className="space-y-4 place-items-end">
                                <div>
                                    <h5>{t("acquire")}</h5>
                                    <div className="flex space-x-4 items-center">
                                        <LxLogo />
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <RotatingText
                                        texts={["Windows", "macOS", "Linux"]}
                                        mainClassName="px-2 bg-amber-600 overflow-hidden py-0.5 rounded-lg"
                                        staggerFrom={"last"}
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        exit={{ y: "-120%" }}
                                        staggerDuration={0.025}
                                        splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                                        rotationInterval={4000}
                                    />
                                    <RotatingText
                                        texts={["X64", "Arm64"]}
                                        mainClassName="px-2 bg-indigo-700 overflow-hidden py-0.5 rounded-lg"
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

                            {isLoading && (
                                <Loading
                                    className="w-full h-[100px]"
                                    indicator
                                    loading
                                    preventScrollThrough
                                    showOverlay
                                />
                            )}

                            {isLoading !== undefined && !isLoading && (
                                <div className="pt-8">
                                    <Dropdown
                                        minColumnWidth={"190px"}
                                        direction="right"
                                        hideAfterItemClick
                                        options={downloadOptions}
                                        placement="bottom"
                                        trigger="hover"
                                        onClick={onMenuItemClicked}>
                                        <Button size="large" variant="base">
                                            <span>{t("downloadNow")}</span>
                                        </Button>
                                    </Dropdown>
                                </div>
                            )}
                        </div>
                    </div>
                </BannerContainer>
            </div>
        </>
    );
}

// Must Keep for ReactRouter
export const Component = () => LxDownload();
