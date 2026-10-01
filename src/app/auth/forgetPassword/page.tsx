import { Component as Page } from "@/features/Auth/AuthForgetPassword";
import { Suspense } from "react";

export const metadata = { title: "忘记密码" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
