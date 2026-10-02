"use client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown as ChevronDownIcon, Code as CodeIcon, Rocket as RocketIcon } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Button, Dropdown, Loading } from "../../components/marathon/index.tsx";
import { DropdownOption } from "../../components/marathon/index.tsx";
import { getBuildName } from "../../helpers/BuildHelper.ts";
import { detectPlatform, detectPlatformAsync, saveDetectedPlatform } from "../../helpers/PlatformHelper.ts";
import { useNavigate } from "../../lib/navigation.ts";
import { lxBackendUrl } from "../../requests/ApiConstants.ts";
import { LauncherRawBuildModel, getAllStableBuildsAsync } from "../../requests/LxBuildRequests.ts";

const latestToken = "net10.0";

interface RecommendedBuild {
    name: string;
    url: string;
}

function LxDownload() {
    const { t } = useTranslation();
    const navigate = useNavigate(); // Added hook usage
    const buildsQuery = useQuery({
        queryKey: ["launcherBuilds", latestToken],
        queryFn: async () => {
            const builds = await getAllStableBuildsAsync();
            if (!builds) throw new Error("Unable to load launcher builds");
            return builds;
        }
    });

    const platformQuery = useQuery({
        queryKey: ["detectedPlatform"],
        queryFn: detectPlatformAsync,
        enabled: typeof window !== "undefined",
        staleTime: Infinity
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

        const platform = platformQuery.data ?? { os: "Unknown", arch: "Unknown" };
        const { os, arch } = platform;
        let bestMatch: RecommendedBuild | null = null;
        let fallbackMatch: RecommendedBuild | null = null;

        const targetKeyExact = `${os} ${arch}`;
        const targetKeyFallback = arch === "Unknown" ? null : os === "macOS" ? `${os} Intel` : `${os} X64`;

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
    }, [buildsQuery.data, platformQuery.data]);

    function onMenuItemClicked(dropdownItem: DropdownOption) {
        if (!dropdownItem.value) return;
        const value = dropdownItem.value as string;
        saveDetectedPlatform(platformQuery.data ?? detectPlatform());
        navigate("/lx/download/thanks");
        window.open(value, "_blank", "noopener,noreferrer");
    }

    function onRecommendedDownloadClick() {
        if (recommendedBuild?.url) {
            saveDetectedPlatform(platformQuery.data ?? detectPlatform());
            navigate("/lx/download/thanks");
            window.open(recommendedBuild.url, "_blank", "noopener,noreferrer");
        }
    }

    return (
        <section className="m-section">
            <div className="m-container">
                <div className="m-rule m-kicker">
                    <span>LX—002 / DOWNLOAD CENTER</span>
                    <span>STABLE CHANNEL / .NET 10</span>
                </div>
                <div className="grid lg:grid-cols-2 gap-12 py-12">
                    <div>
                        <h1>
                            READY TO
                            <br />
                            LAUNCH<span className="text-muted-foreground">/</span>
                        </h1>
                        <p className="text-muted-foreground mt-8 leading-8">{t("lxDescription")}</p>
                        <p className="m-kicker mt-8">WINDOWS / MACOS / LINUX · X64 / ARM64</p>
                        <Image
                            src="/assets/lx/LauncherX_1.webp"
                            alt="LauncherX"
                            width={1280}
                            height={720}
                            sizes="(max-width: 900px) 100vw, 50vw"
                            className="mt-10 border border-border"
                        />
                    </div>
                    <div className="m-panel self-start">
                        <p className="m-kicker mb-6">SELECT YOUR BUILD</p>
                        <h2 className="text-3xl">{t("download")} LauncherX</h2>
                        <p className="m-kicker my-6">RELEASE / {(updatedAt ?? "—").split("T")[0]}</p>
                        {(buildsQuery.isLoading || platformQuery.isLoading) && <Loading />}
                        {buildsQuery.isError && (
                            <div className="space-y-4">
                                <p role="alert" className="text-destructive">
                                    {t("failedToLoadBuildsDescription")}
                                </p>
                                <Button variant="outline" onClick={() => void buildsQuery.refetch()}>
                                    {t("retry")}
                                </Button>
                            </div>
                        )}
                        {buildsQuery.isSuccess && !platformQuery.isLoading && (
                            <>
                                <Button
                                    size="large"
                                    block
                                    disabled={!recommendedBuild}
                                    onClick={onRecommendedDownloadClick}
                                    icon={<RocketIcon className="size-4" />}>
                                    {recommendedBuild
                                        ? `${t("download")} / ${recommendedBuild.name}`
                                        : t("noRecommendedBuild")}
                                </Button>
                                <div className="mt-4">
                                    <Dropdown options={downloadOptions} onClick={onMenuItemClicked}>
                                        <Button
                                            block
                                            theme="default"
                                            variant="outline"
                                            icon={<ChevronDownIcon className="size-4" />}>
                                            {t("otherBuilds")}
                                        </Button>
                                    </Dropdown>
                                </div>
                                <p className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
                                    <CodeIcon className="size-4" /> .NET 10
                                </p>
                                <div className="mt-8 border-t border-border">
                                    {downloadOptions.map((option) => (
                                        <button
                                            key={String(option.value)}
                                            className="flex w-full justify-between gap-3 border-b border-border py-4 text-sm text-left hover:text-muted-foreground"
                                            onClick={() => onMenuItemClicked(option)}>
                                            {option.content}
                                            <span aria-hidden="true">↗</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
export const Component = () => LxDownload();
