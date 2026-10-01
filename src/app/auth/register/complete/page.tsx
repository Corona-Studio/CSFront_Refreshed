import { Component as Page } from "@/features/Auth/AuthRegisterComplete";
import { Suspense } from "react";

export const metadata = { title: "完成注册" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
