import i18next from "i18next";
import { lazy, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router";
import { ChevronDownIcon, IconFont } from "tdesign-icons-react";
import { Button, Dropdown, Loading, NotificationPlugin, Space } from "tdesign-react";
import { DropdownOption } from "tdesign-react/es/dropdown/type";

import { getBuildName } from "../../helpers/BuildHelper.ts";
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
    const navigate = useNavigate(); // Added hook usage
    const [isLoading, setIsLoading] = useState<boolean | undefined>(true);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
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

        sessionStorage.setItem("detectedOS", os);
        sessionStorage.setItem("detectedArch", arch);

        return { os, arch };
    }

    async function getLauncherBuilds() {
        const builds = await getAllStableBuildsAsync();

        if (!builds) {
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

        for (const fetchedBuild of builds) {
            const build = fetchedBuild as LauncherRawBuildModel;
            const url = `${lxBackendUrl}/Build/get/${build.id}/${build.framework}.${build.runtime}.zip`;
            const buildName = getBuildName(build.framework, build.runtime);

            options.push({
                content: buildName,
                value: url
            });

            buildsArray.push({ key: buildName, build });
        }

        setDownloadOptions(options);
        setUpdatedAt(builds[0]!.releaseDate ?? null);

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
        getLauncherBuilds();
    }, []); // eslint-disable-line

    function onMenuItemClicked(dropdownItem: DropdownOption) {
        if (!dropdownItem.value) return;
        const value = dropdownItem.value as string;
        const { os, arch } = detectPlatform();
        sessionStorage.setItem("detectedOS", os);
        sessionStorage.setItem("detectedArch", arch);
        navigate("/lx/download/thanks");
        window.open(value, "_blank");
    }

    function onRecommendedDownloadClick() {
        if (recommendedBuild?.url) {
            const { os, arch } = detectPlatform();
            sessionStorage.setItem("detectedOS", os);
            sessionStorage.setItem("detectedArch", arch);
            navigate("/lx/download/thanks");
            window.open(recommendedBuild.url, "_blank");
        }
    }

    return (
        <>
            <Helmet>
                <title>LauncherX {t("download")} - Corona Studio</title>
                <meta name="description" content={t("lxDescription")} />
            </Helmet>

            <div>
                <BannerContainer innerDivClassName="overflow-clip">
                    <div className="fixed inset-0 z-0">
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

                    <div className="relative z-10 w-full h-full grid place-items-center">
                        <div className="place-items-center text-center">
                            {" "}
                            <div className="space-y-4 place-items-center">
                                {" "}
                                <div>
                                    <h5 className="text-gray-900 dark:text-white">{t("acquire")}</h5>
                                    <div className="flex justify-center space-x-4 items-center">
                                        {" "}
                                        <div className="text-current">
                                            <LxLogo textClassName="font-bold text-gray-900 dark:text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center space-x-2">
                                    {" "}
                                    <span
                                        className="inline-block align-middle relative text-black dark:text-white px-3 bg-zinc-300 dark:bg-zinc-700 overflow-hidden py-1 rounded-lg">
                                        <div>
                                            <IconFont className="inline-block -translate-y-0.5" name="rocket" /> {(updatedAt ?? "-").split("T")[0]}
                                        </div>
                                    </span>
                                    <RotatingText
                                        texts={["Windows", "macOS", "Linux"]}
                                        mainClassName="text-black dark:text-white px-3 bg-amber-400 dark:bg-amber-600 overflow-hidden py-1 rounded-lg"
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
                                        mainClassName="text-black dark:text-white px-3 bg-indigo-400 dark:bg-indigo-600 overflow-hidden py-1 rounded-lg"
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
                                    className="w-full h-[100px] mt-8"
                                    indicator
                                    loading
                                    preventScrollThrough
                                    showOverlay={false}
                                />
                            )}
                            {isLoading === false && (
                                <div className="pt-8">
                                    <Space size="small">
                                        <Button
                                            size="large"
                                            theme="primary"
                                            variant="base"
                                            disabled={!recommendedBuild}
                                            onClick={onRecommendedDownloadClick}>
                                            <span className="text-black dark:text-white">
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
                                            placement="bottom-right"
                                            trigger="click"
                                            onClick={onMenuItemClicked}>
                                            <Button
                                                theme="primary"
                                                size="large"
                                                variant="outline"
                                                style={{ backgroundColor: "transparent" }}
                                                icon={<ChevronDownIcon />}></Button>
                                        </Dropdown>
                                    </Space>
                                </div>
                            )}
                            {isLoading === undefined && (
                                <div className="pt-8">
                                    <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-lg border border-red-300 dark:border-red-700 text-center">
                                        <div className="text-red-700 dark:text-red-400 text-lg font-medium mb-2">
                                            {t("failedToLoadBuilds")}
                                        </div>
                                        <p className="text-red-600 dark:text-red-300/80 mb-4">
                                            {t("failedToLoadBuildsDescription")}
                                        </p>
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

// Must Keep for ReactRouter
export const Component = () => LxDownload();
