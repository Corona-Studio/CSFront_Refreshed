import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="m-container py-24">
            <p className="m-kicker">SYSTEM / 404</p>
            <h1 className="mt-6">迷失在边界之外</h1>
            <p className="my-8 text-muted-foreground">没有找到你访问的页面。</p>
            <Button asChild>
                <Link href="/">返回首页</Link>
            </Button>
        </div>
    );
}
