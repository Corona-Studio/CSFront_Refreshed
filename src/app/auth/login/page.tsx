import { Suspense } from "react";

import { Component as Page } from "@/features/Auth/AuthLogin";

export const metadata = { title: "登录" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
