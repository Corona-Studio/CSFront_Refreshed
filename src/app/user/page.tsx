import Page from "@/features/User/UserHome";
import { Suspense } from "react";

export const metadata = { title: "用户中心" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
