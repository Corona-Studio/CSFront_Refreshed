import { Component as Page } from "@/features/Auth/AuthLogin";
import { Suspense } from "react";

export const metadata = { title: "登录" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
