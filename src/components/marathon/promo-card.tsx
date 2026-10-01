"use client";

import { ArrowUpRight } from "lucide-react";

import { Button } from "./controls";
import { Card } from "./layout";

export default function PromoCard({
    image,
    title,
    description,
    href,
    actionLabel
}: {
    image: string;
    title: string;
    description: string;
    href: string;
    actionLabel: string;
}) {
    return (
        <Card
            className="h-full overflow-hidden"
            cover={<img src={image} alt={title} loading="lazy" className="block w-full aspect-video object-cover" />}>
            <div className="flex flex-wrap items-center gap-5">
                <div className="flex-1 basis-60 min-w-0">
                    <h3 className="text-lg font-bold leading-snug">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
                <Button href={href} target="_blank" className="shrink-0">
                    {actionLabel}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                </Button>
            </div>
        </Card>
    );
}
