import { Component as Page } from "@/features/Auth/AuthRegister";
import { Suspense } from "react";

export const metadata = { title: "注册" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
