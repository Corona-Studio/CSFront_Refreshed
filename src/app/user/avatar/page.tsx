import { Component as Page } from "@/features/User/UserAvatar";
import { Suspense } from "react";

export const metadata = { title: "更换头像" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
