import Page from "@/features/LauncherX/LxHome";
import { Suspense } from "react";

export const metadata = { title: "LauncherX" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
