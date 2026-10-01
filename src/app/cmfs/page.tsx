import Page from "@/features/CMFS";
import { Suspense } from "react";

export const metadata = { title: "CMFS 社区" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
