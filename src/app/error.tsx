"use client";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="m-container py-24">
            <p className="m-kicker">SYSTEM / ERROR</p>
            <h1 className="mt-6">页面暂时不可用</h1>
            <p className="my-8 text-muted-foreground">请重试，或稍后返回。</p>
            <Button onClick={reset}>重新加载</Button>
        </div>
    );
}
