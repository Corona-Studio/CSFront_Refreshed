import { csBackend } from "./ApiConstants.ts";

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

export async function getAllStableBuildsAsync(): Promise<LauncherRawBuildModel[] | undefined> {
    const endPoint = "/Build/get/latest/all/stable";

    try {
        const response = await csBackend.get<LauncherRawBuildModel[]>(endPoint);

        if (!response.data || response.data.size === 0) return undefined;

        return response.data;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}
