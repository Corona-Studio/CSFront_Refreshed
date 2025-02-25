import IResponse from "../interfaces/IResponse.ts";
import { buildHeader, getAsync } from "./ApiConstants.ts";

interface DashboardData {
    type: string;
    dataTitleKey: string;
    dataDescKey: string;
    count: string;
}

export async function getDashboardData(token: string): Promise<IResponse<DashboardData[]> | undefined> {
    const endPoint = "/Admin/dashboard";

    return await getAsync<DashboardData[]>(endPoint, buildHeader(token));
}
