import type { PublicPage } from "./seo";

export function socialImage(page: PublicPage) {
    const titles = {
        home: "CORONA STUDIO",
        launcherx: "LauncherX",
        "launcherx-download": "DOWNLOAD LauncherX",
        cmfs: "CMFS / CraftMineFun"
    };
    const subtitles = {
        home: "Minecraft tools. Open source. Community.",
        launcherx: "Your next Minecraft adventure starts here.",
        "launcherx-download": "Windows / macOS / Linux",
        cmfs: "Build worlds. Connect with friends."
    };
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: "100%",
                height: "100%",
                padding: "64px",
                background: "#151411",
                color: "#f3eee2",
                borderTop: "20px solid #ffb21a",
                fontFamily: "sans-serif"
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#ffb21a" }}>
                <span>CORONA STUDIO</span>
                <span>PLAY / BUILD / CONNECT</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                    style={{
                        display: "flex",
                        fontSize: page.slug === "launcherx-download" ? 72 : 88,
                        fontWeight: 700,
                        letterSpacing: "-3px"
                    }}>
                    {titles[page.slug]}
                </div>
                <div style={{ display: "flex", fontSize: 32, marginTop: 24, color: "#b4ac9b" }}>
                    {subtitles[page.slug]}
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: "1px solid #454033",
                    paddingTop: "24px",
                    fontSize: 24
                }}>
                <span>corona.studio{page.path === "/" ? "" : page.path}</span>
                <span style={{ color: "#ffb21a" }}>INDEPENDENT SINCE 2016</span>
            </div>
        </div>
    );
}
