const buildMap: Map<string, string> = new Map<string, string>([
    ["net9.0-windows-win-x64", "Windows X64"],
    ["net9.0-windows-win-arm64", "Windows Arm64"],
    ["net9.0-osx-osx-x64", "macOS Intel"],
    ["net9.0-osx-osx-arm64", "macOS Apple"],
    ["net9.0-linux-linux-x64", "Linux X64"],
    ["net9.0-linux-linux-arm64", "Linux Arm64"]
]);

export function getBuildName(framework: string, runtime: string): string {
    const key = `${framework}-${runtime}`;
    return buildMap.get(key) || "Unknown Build";
}
