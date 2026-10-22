import { Suspense } from "react";

import { Component as Page } from "@/features/Auth/AuthForgetPassword";

export const metadata = { title: "忘记密码" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
