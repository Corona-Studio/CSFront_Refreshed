import { Suspense } from "react";

import { Component as Page } from "@/features/Auth/AuthResetPassword";

export const metadata = { title: "重设密码" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
