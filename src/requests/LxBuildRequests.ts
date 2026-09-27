import { getAsync } from "./ApiConstants.ts";

export interface LauncherRawBuildModel {
    id: string;
    branch: string;
    channel: number;
    releaseDate: string;
    releaseNote: string;
    fileHash: string;

    isPublished: boolean;

    framework: string;
    runtime: string;
}

export async function getAllStableBuildsAsync(): Promise<LauncherRawBuildModel[] | undefined> {
    const result = await getAsync<LauncherRawBuildModel[]>("/Build/get/latest/all/stable");
    return result.status === 200 && result.response?.length ? result.response : undefined;
}
