"use client";
import showcase from "@/components/motion/showcase.module.css";
import motionStyles from "@/components/motion/interactions.module.css";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { AvatarFallback, AvatarImage, Avatar as AvatarRoot } from "@/components/ui/avatar";
import {
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    Card as CardRoot,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton as SkeletonRoot } from "@/components/ui/skeleton";
import i18n from "@/i18n";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2, X } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Children, useState } from "react";

export interface PanelProps {
    children?: ReactNode;
    title?: ReactNode;
    subtitle?: ReactNode;
    actions?: ReactNode;
    footer?: ReactNode;
    cover?: ReactNode;
    className?: string;
    style?: CSSProperties;
    bordered?: boolean;
    headerBordered?: boolean;
    hoverShadow?: boolean;
    theme?: string;
}
export function Card({ children, title, subtitle, actions, footer, cover, className, style, hoverShadow }: PanelProps) {
    return (
        <CardRoot
            className={cn(
                "rounded-none shadow-none gap-0 py-0 border-border bg-card",
                hoverShadow && motionStyles.card,
                className
            )}
            style={style}>
            {typeof cover === "string" ? <img src={cover} alt="" loading="lazy" /> : cover}
            {(title || subtitle || actions) && (
                <CardHeader className="flex flex-row justify-between gap-4 border-b border-border py-5">
                    <div>
                        {title && <CardTitle>{title}</CardTitle>}
                        {subtitle && <CardDescription className="mt-2">{subtitle}</CardDescription>}
                    </div>
                    {actions}
                </CardHeader>
            )}
            {Children.toArray(children).length > 0 && <CardContent className="p-6 min-w-0">{children}</CardContent>}
            {footer && <CardFooter className="border-t border-border px-6 py-4">{footer}</CardFooter>}
        </CardRoot>
    );
}
export function Space({
    children,
    direction,
    size,
    className,
    style
}: {
    children?: ReactNode;
    direction?: string;
    size?: string | number;
    className?: string;
    style?: CSSProperties;
    breakLine?: boolean;
}) {
    return (
        <div
            style={{ gap: typeof size === "number" ? size : undefined, ...style }}
            className={cn(
                "flex gap-3",
                direction === "vertical" ? "flex-col" : "flex-wrap items-center",
                size === "large" && "gap-6",
                size === "small" && "gap-2",
                className
            )}>
            {children}
        </div>
    );
}
export function Row({
    children,
    className
}: {
    children?: ReactNode;
    className?: string;
    gutter?: number | number[];
    justify?: string;
    align?: string;
}) {
    return <div className={cn("grid grid-cols-12 gap-4", className)}>{children}</div>;
}
const spans: Record<number, string> = {
    3: "md:col-span-3",
    4: "md:col-span-4",
    6: "md:col-span-6",
    8: "md:col-span-8",
    12: "md:col-span-12"
};
export function Col({
    children,
    span = 12,
    md,
    lg,
    className
}: {
    children?: ReactNode;
    span?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    className?: string;
}) {
    return <div className={cn("col-span-12 min-w-0", spans[lg ?? md ?? span], className)}>{children}</div>;
}
export function Alert({
    title,
    message,
    theme = "info",
    operation,
    close,
    className,
    icon
}: {
    title?: ReactNode;
    message?: ReactNode;
    theme?: string;
    operation?: ReactNode;
    close?: boolean;
    className?: string;
    icon?: ReactNode;
}) {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;
    return (
        <div
            role={theme === "error" ? "alert" : "status"}
            className={cn(
                "flex items-start gap-3 border border-border bg-muted p-4 text-sm",
                theme === "error" && "border-destructive text-destructive",
                className
            )}>
            {icon ?? <AlertCircle className="mt-0.5 size-4" />}
            <div className="min-w-0 flex-1">
                {title && <strong className="block mb-2">{title}</strong>}
                {message}
                {operation}
            </div>
            {close && (
                <button onClick={() => setDismissed(true)} aria-label={i18n.t("close")}>
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}
export function Loading({
    children,
    loading = true,
    className,
    text
}: {
    children?: ReactNode;
    loading?: boolean;
    className?: string;
    text?: ReactNode;
    indicator?: boolean;
    preventScrollThrough?: boolean;
    showOverlay?: boolean;
    size?: string | number;
    fullscreen?: boolean;
    delay?: number;
}) {
    return (
        <div aria-busy={loading} className={cn("relative", className)}>
            {loading && (
                <div role="status" className="flex items-center justify-center gap-3 p-6">
                    <Loader2 className="size-5 animate-spin" />
                    <span className="text-sm">{text ?? i18n.t("loading")}</span>
                </div>
            )}
            {children}
        </div>
    );
}
export function Empty({ description }: { description?: ReactNode }) {
    return (
        <div className="border border-dashed border-border p-12 text-center text-muted-foreground text-sm">
            {description ?? i18n.t("noData")}
        </div>
    );
}
export function Skeleton({
    loading = true,
    children,
    className
}: {
    loading?: boolean;
    children?: ReactNode;
    className?: string;
    animation?: string;
    theme?: string;
}) {
    return loading ? <SkeletonRoot className={cn("h-24 w-full rounded-none", className)} /> : children;
}
export function Avatar({
    image,
    children,
    size = "40px"
}: {
    image?: string;
    children?: ReactNode;
    size?: string;
    shape?: string;
}) {
    return (
        <AvatarRoot style={{ width: size, height: size }}>
            <AvatarImage src={image} />
            <AvatarFallback>{children ?? "CS"}</AvatarFallback>
        </AvatarRoot>
    );
}
export function Divider({ className }: { className?: string; align?: string; layout?: string }) {
    return <Separator className={cn("my-6", className)} />;
}
export function Comment({ author, content }: { author?: ReactNode; content?: ReactNode }) {
    return (
        <div>
            <strong>{author}</strong>
            <p className="mt-2 text-sm text-muted-foreground">{content}</p>
        </div>
    );
}
export function SectionHeading({
    code,
    title,
    description
}: {
    code: string;
    title: ReactNode;
    description?: ReactNode;
}) {
    return (
        <ScrollReveal className={`mb-10 ${showcase.heading}`}>
            <div className={`m-rule m-kicker ${showcase.headingRule}`}>
                <span className={showcase.headingCode}>{code}</span>
                <span className={showcase.headingMeta}>CORONA STUDIO / SYSTEMS</span>
            </div>
            <h2>{title}</h2>
            {description && <p className="mt-5 max-w-2xl text-muted-foreground leading-8">{description}</p>}
        </ScrollReveal>
    );
}
