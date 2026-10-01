"use client";
import { SectionHeading } from "@/components/marathon";
import { Button } from "@/components/ui/button";
import { detectPlatform, getSavedOperatingSystem } from "@/helpers/PlatformHelper";
import { ArrowUpRight, CircleCheck } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

const subscribe = () => () => {};
const snapshot = () => getSavedOperatingSystem() ?? detectPlatform().os;
function LxDownloadThanks() {
    const { t } = useTranslation();
    const os = useSyncExternalStore(subscribe, snapshot, () => null);
    const guides = [
        { os: "Windows", key: "windowsSetupGuide", path: "windows" },
        { os: "macOS", key: "macosSetupGuide", path: "macOS" },
        { os: "Linux", key: "linuxSetupGuide", path: "linux" }
    ];
    return (
        <section className="m-section">
            <div className="m-container">
                <CircleCheck className="size-12 mb-8 text-success" />
                <SectionHeading
                    code="LX—003 / INSTALLATION"
                    title={t("downloadThanks")}
                    description={t("downloadThanksFollowGuide")}
                />
                <div className="m-grid">
                    {guides.map((guide) => (
                        <article key={guide.os}>
                            <p className="m-kicker mb-8">{os === guide.os ? "RECOMMENDED / 推荐" : "SETUP GUIDE"}</p>
                            <h3 className="text-3xl">{guide.os}</h3>
                            <p>{t(guide.key)}</p>
                            <Button asChild variant={os === guide.os ? "default" : "outline"}>
                                <a
                                    href={`https://kb.corona.studio/zhCN/lxguide/startup/perOsSetup/${guide.path}.html`}
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    {t("viewGuide")}
                                    <ArrowUpRight />
                                </a>
                            </Button>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
export const Component = () => <LxDownloadThanks />;
