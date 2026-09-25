import { useQuery } from "@tanstack/react-query";
import i18next from "i18next";
import { lazy, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router";
import { ChevronDownIcon, CodeIcon, RocketIcon } from "tdesign-icons-react";
import { Button, Dropdown, Loading, Space } from "tdesign-react";
import { DropdownOption } from "tdesign-react/es/dropdown/type";

import { getBuildName } from "../../helpers/BuildHelper.ts";
import { envVal } from "../../helpers/EnvHelper.ts";
import { detectPlatform, saveDetectedPlatform } from "../../helpers/PlatformHelper.ts";
import { lxBackendUrl } from "../../requests/ApiConstants.ts";
import { LauncherRawBuildModel, getAllStableBuildsAsync } from "../../requests/LxBuildRequests.ts";

const Waves = lazy(() => import("../../ReactBits/Backgrounds/Waves/Waves.tsx"));
const RotatingText = lazy(() => import("../../ReactBits/TextAnimations/RotatingText/RotatingText.tsx"));
const BannerContainer = lazy(() => import("../../components/BannerContainer.tsx"));
const LxLogo = lazy(() => import("../../components/LxLogo.tsx"));

const t = i18next.t;
const latestToken = "net10.0";

interface RecommendedBuild {
    name: string;
    url: string;
}

function LxDownload() {
    const navigate = useNavigate(); // Added hook usage
    const buildsQuery = useQuery({
        queryKey: ["launcherBuilds", latestToken],
        queryFn: async () => {
            const builds = await getAllStableBuildsAsync();
            if (!builds) throw new Error("Unable to load launcher builds");
            return builds;
        }
    });

    const { downloadOptions, recommendedBuild, updatedAt } = useMemo(() => {
        const options: DropdownOption[] = [];
        const buildsArray: { key: string; build: LauncherRawBuildModel; date: string }[] = [];

        for (const build of buildsQuery.data ?? []) {
            if (!build.framework.startsWith(latestToken)) continue;

            const url = `${lxBackendUrl}/Build/get/${build.id}/${build.framework}.${build.runtime}.zip`;
            const buildName = getBuildName(build.framework, build.runtime, latestToken);

            options.push({
                content: buildName,
                value: url
            });
            buildsArray.push({ key: buildName, build, date: build.releaseDate });
        }

        const platform = detectPlatform();
        const { os, arch } = platform;
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
            if (key === targetKeyFallback) fallbackMatch = { name: key, url };
        }

        return {
            downloadOptions: options,
            recommendedBuild: bestMatch ?? fallbackMatch,
            updatedAt: buildsArray[0]?.date ?? null
        };
    }, [buildsQuery.data]);

    function onMenuItemClicked(dropdownItem: DropdownOption) {
        if (!dropdownItem.value) return;
        const value = dropdownItem.value as string;
        saveDetectedPlatform(detectPlatform());
        navigate("/lx/download/thanks");
        window.open(value, "_blank", "noopener,noreferrer");
    }

    function onRecommendedDownloadClick() {
        if (recommendedBuild?.url) {
            saveDetectedPlatform(detectPlatform());
            navigate("/lx/download/thanks");
            window.open(recommendedBuild.url, "_blank", "noopener,noreferrer");
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
                            waveSpeedX={envVal(0, 0.0125)}
                            waveSpeedY={envVal(0, 0.01)}
                            waveAmpX={envVal(0, 40)}
                            waveAmpY={envVal(0, 20)}
                            friction={envVal(0, 0.9)}
                            tension={envVal(0, 0.01)}
                            maxCursorMove={envVal(0, 120)}
                            xGap={envVal(20, 12)}
                            yGap={envVal(20, 36)}
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
                                <div className="flex justify-center flex-wrap gap-1 md:gap-2 lg:gap-3">
                                    {" "}
                                    <span className="inline-block align-middle relative text-black dark:text-white px-3 bg-zinc-300 dark:bg-zinc-700 overflow-hidden py-1 rounded-lg">
                                        <div>
                                            <RocketIcon className="inline-block -translate-y-0.5" />{" "}
                                            {(updatedAt ?? "-").split("T")[0]}
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
                            {buildsQuery.isLoading && (
                                <Loading
                                    className="w-full h-[100px] mt-5"
                                    indicator
                                    loading
                                    preventScrollThrough
                                    showOverlay={false}
                                />
                            )}
                            {buildsQuery.isSuccess && (
                                <div className="pt-5">
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
                                    <div className="pt-3 text-black dark:text-white opacity-50 text-sm">
                                        <CodeIcon className="-translate-y-0.5 text-base" /> dot
                                        {latestToken.replace("net", "Net ")}
                                    </div>
                                </div>
                            )}
                            {buildsQuery.isError && (
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
                                            onClick={() => buildsQuery.refetch()}>
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
