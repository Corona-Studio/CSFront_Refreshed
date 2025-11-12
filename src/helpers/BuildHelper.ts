const buildMap: Map<string, string> = new Map<string, string>([
    ["-windows-win-x64", "Windows X64"],
    ["-windows-win-arm64", "Windows Arm64"],
    ["-osx-osx-x64", "macOS Intel"],
    ["-osx-osx-arm64", "macOS Apple"],
    ["-linux-linux-x64", "Linux X64"],
    ["-linux-linux-arm64", "Linux Arm64"]
]);

export function getBuildName(framework: string, runtime: string, dotNetVersion: string): string {
    const key = `${framework}-${runtime}`;
    return buildMap.get(key.replace(dotNetVersion, "")) || "Unknown Build";
}
