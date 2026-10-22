"use client";

export default function ConditionBreak({ className }: { className?: string }) {
    return (
        <span className={className ?? `inline md:hidden`}>
            <br />
        </span>
    );
}
