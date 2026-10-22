import { Suspense } from "react";

import { Component as Page } from "@/features/Auth/AuthRegisterComplete";

export const metadata = { title: "完成注册" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
