import i18next from "i18next";
import { lazy, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronDownIcon } from "tdesign-icons-react";
import { Button, Dropdown, Loading, NotificationPlugin, Space } from "tdesign-react";
import { DropdownOption } from "tdesign-react/es/dropdown/type";

import { envVal } from "../../helpers/EnvHelper.ts";
import { lxBackendUrl } from "../../requests/ApiConstants.ts";
import { LauncherRawBuildModel, getAllStableBuildsAsync } from "../../requests/LxBuildRequests.ts";

const Waves = lazy(() => import("../../ReactBits/Backgrounds/Waves/Waves.tsx"));
const RotatingText = lazy(() => import("../../ReactBits/TextAnimations/RotatingText/RotatingText.tsx"));
const BannerContainer = lazy(() => import("../../components/BannerContainer.tsx"));
const LxLogo = lazy(() => import("../../components/LxLogo.tsx"));

const t = i18next.t;

interface RecommendedBuild {
    name: string;
    url: string;
}

function LxDownload() {
    const [isLoading, setIsLoading] = useState<boolean | undefined>(true);
    const [downloadOptions, setDownloadOptions] = useState<DropdownOption[]>([]);
    const [recommendedBuild, setRecommendedBuild] = useState<RecommendedBuild | null>(null);

    function detectPlatform(): { os: string; arch: string } {
        const uaLower = navigator.userAgent.toLowerCase();
        let os = "Unknown";
        let arch = "Unknown";

        if (uaLower.includes("window")) {
            os = "Windows";
        } else if (uaLower.includes("mac")) {
            os = "macOS";
        } else if (uaLower.includes("linux")) {
            os = "Linux";
        }

        if (os === "macOS") {
            try {
                const canvas = document.createElement("canvas");
                const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
                if (gl) {
                    const webgl = gl as WebGLRenderingContext;
                    const debugInfo = webgl.getExtension("WEBGL_debug_renderer_info");
                    const renderer = debugInfo ? webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "";

                    if (typeof renderer === "string") {
                        const rendererLower = renderer.toLowerCase();
                        if (rendererLower.includes("apple") && !rendererLower.includes("apple gpu")) {
                            arch = "Apple";
                        } else if (rendererLower.includes("apple gpu")) {
                            const supportedExtensions = webgl.getSupportedExtensions() || [];
                            if (supportedExtensions.indexOf("WEBGL_compressed_texture_s3tc_srgb") === -1) {
                                arch = "Apple";
                            } else {
                                arch = "Intel";
                            }
                        } else if (
                            rendererLower.includes("intel") ||
                            rendererLower.includes("amd") ||
                            rendererLower.includes("nvidia")
                        ) {
                            arch = "Intel";
                        }
                    }
                }
            } catch (e) {
                console.error("Error during WebGL detection:", e);
            }

            if (arch === "Unknown") {
                if (uaLower.includes("arm64") || uaLower.includes("aarch64")) {
                    arch = "Apple";
                } else {
                    arch = "Intel";
                }
            }
        } else if (uaLower.includes("arm64") || uaLower.includes("aarch64")) {
            arch = "Arm64";
        } else if (uaLower.includes("win64") || uaLower.includes("wow64") || uaLower.includes("x64")) {
            arch = "X64";
        }

        if (os !== "Unknown" && arch === "Unknown") {
            arch = os === "macOS" ? "Intel" : "X64";
        }

        return { os, arch };
    }

    async function getLauncherBuilds() {
        const buildsMap = await getAllStableBuildsAsync();

        if (!buildsMap) {
            await NotificationPlugin.info({
                title: "获取失败",
                content: "无法获取构建列表",
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
        const buildsArray: { key: string; build: LauncherRawBuildModel }[] = [];

        for (const [key, value] of Object.entries(buildsMap)) {
            const build = value as LauncherRawBuildModel;
            const url = `${lxBackendUrl}/Build/get/${build.id}/${build.framework}.${build.runtime}.zip`;
            options.push({
                content: key,
                value: url
            });
            buildsArray.push({ key, build });
        }

        setDownloadOptions(options);

        const { os, arch } = detectPlatform();
        let bestMatch: RecommendedBuild | null = null;
        let fallbackMatch: RecommendedBuild | null = null;

        const targetKeyExact = `${os} ${arch}`;
        const targetKeyFallback = os === "macOS" ? `${os} Intel` : `${os} X64`;

        for (const { key, build } of buildsArray) {
            const url = `${lxBackendUrl}/Build/get/${build.id}/${build.framework}.${build.runtime}.zip`;

            if (key === targetKeyExact) {
                bestMatch = { name: key, url: url };
                break;
            }
            if (key === targetKeyFallback) {
                fallbackMatch = { name: key, url: url };
            }
        }

        const finalRecommendation = bestMatch ?? fallbackMatch;
        setRecommendedBuild(finalRecommendation);

        setIsLoading(false);
    }

    useEffect(() => {
        getLauncherBuilds().then();
    });

    function onMenuItemClicked(dropdownItem: DropdownOption) {
        if (!dropdownItem.value) return;
        const value = dropdownItem.value as string;
        window.open(value, "_blank");
    }

    function onRecommendedDownloadClick() {
        if (recommendedBuild?.url) {
            window.open(recommendedBuild.url, "_blank");
        }
    }

    return (
        <>
            <Helmet>
                <title>LauncherX {t("download")} - Corona Studio</title>
                <meta name="description" content={t("lxDescription")} />
            </Helmet>

            <div className="bg-black">
                <BannerContainer innerDivClassName="overflow-clip">
                    <div className="z-0 w-full h-full">
                        <Waves
                            lineColor={envVal("oklch(44.2% 0.017 285.786)", "#6c4b00")}
                            waveSpeedX={envVal(0, 0.02)}
                            waveSpeedY={envVal(0, 0.01)}
                            waveAmpX={envVal(0, 40)}
                            waveAmpY={envVal(0, 20)}
                            friction={envVal(0, 0.9)}
                            tension={envVal(0, 0.01)}
                            maxCursorMove={envVal(0, 120)}
                            xGap={envVal(20, 12)}
                            yGap={envVal(20, 36)}
                            slantFactor={0.5}
                            lineOpacity={0.3}
                        />
                    </div>

                    <div className="z-10 absolute w-full h-full grid place-items-center">
                        <div className="place-items-center">
                            <div className="space-y-4 place-items-end">
                                <div>
                                    <h5 className="text-white">{t("acquire")}</h5>
                                    <div className="flex space-x-4 items-center">
                                        <LxLogo />
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <RotatingText
                                        texts={["Windows", "macOS", "Linux"]}
                                        mainClassName="text-white px-3 bg-amber-600 text-black overflow-hidden py-1 rounded-lg"
                                        staggerFrom={"last"}
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        exit={{ y: "-120%" }}
                                        staggerDuration={0.025}
                                        splitLevelClassName="overflow-hidden"
                                        rotationInterval={4000}
                                    />
                                    <RotatingText
                                        texts={["X64", "Arm64"]}
                                        mainClassName="text-white px-3 bg-indigo-500 text-black overflow-hidden py-1 rounded-lg"
                                        staggerFrom={"last"}
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        exit={{ y: "-120%" }}
                                        staggerDuration={0.025}
                                        splitLevelClassName="overflow-hidden"
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

                            {isLoading === false && (
                                <div className="pt-8">
                                    <Space size="small">
                                        <Button
                                            size="large"
                                            variant="base"
                                            disabled={!recommendedBuild}
                                            onClick={onRecommendedDownloadClick}>
                                            <span>
                                                {recommendedBuild
                                                    ? `${t("download")} (${recommendedBuild.name})`
                                                    : t("noRecommendedBuild")}
                                            </span>
                                        </Button>

                                        <Dropdown
                                            minColumnWidth={"190px"}
                                            direction="right"
                                            hideAfterItemClick
                                            options={downloadOptions}
                                            placement="bottom"
                                            trigger="click"
                                            onClick={onMenuItemClicked}>
                                            <Button size="large" variant="outline" icon={<ChevronDownIcon />}></Button>
                                        </Dropdown>
                                    </Space>
                                </div>
                            )}

                            {isLoading === undefined && (
                                <div className="pt-8">
                                    <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30 text-center">
                                        <div className="text-red-500 text-lg font-medium mb-2">
                                            {t("failedToLoadBuilds")}
                                        </div>
                                        <p className="text-white/70 mb-4">{t("failedToLoadBuildsDescription")}</p>
                                        <Button
                                            size="large"
                                            variant="outline"
                                            theme="danger"
                                            onClick={getLauncherBuilds}>
                                            {t("retry")}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </BannerContainer>
            </div>
        </>
    );
}

export const Component = () => LxDownload();
