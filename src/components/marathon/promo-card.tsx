"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

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
            cover={
                <Image
                    src={image}
                    alt={title}
                    width={1280}
                    height={720}
                    unoptimized={!image.startsWith("/")}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="block aspect-video w-full object-cover"
                />
            }>
            <div className="flex flex-wrap items-center gap-5">
                <div className="min-w-0 flex-1 basis-60">
                    <h3 className="text-lg leading-snug font-bold">{title}</h3>
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
