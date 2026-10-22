import { Suspense } from "react";

import { Component as Page } from "@/features/Auth/AuthRegister";

export const metadata = { title: "注册" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
