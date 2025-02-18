import axios from "axios";

export interface LauncherRawBuildModel {
    id: string;
    branch: string;
    channel: number;
    releaseDate: string;
    releaseNote: string;
    fileHash: string;

    isHotFix: boolean;
    isApproved: boolean;
    isReviewed: boolean;
    isR2R: boolean;

    framework: string;
    runtime: string;
}

export const lxBackendUrl = import.meta.env.VITE_LX_BACKEND ?? "https://api.corona.studio";

const csBackend = axios.create({
    baseURL: lxBackendUrl
});

export async function getAllStableBuilds(): Promise<Map<string, LauncherRawBuildModel> | undefined> {
    const endPoint = "/Build/get/latest/all/stable";

    try {
        const response = await csBackend.get<Map<string, LauncherRawBuildModel>>(endPoint);

        if (response.status !== 200) return undefined;
        if (!response.data || response.data.size === 0) return undefined;

        return response.data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
