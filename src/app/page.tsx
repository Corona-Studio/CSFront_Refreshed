import Home from "@/features/Home";
import StructuredData from "@/components/StructuredData";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/");
export default function RoutePage() {
    return (
        <>
            <StructuredData path="/" />
            <Home />
        </>
    );
}
