"use client";
import type { FC, ReactNode } from "react";

interface PaperProps {
    children?: ReactNode;
    innerDivClassName?: string;
}

const BannerContainer: FC<PaperProps> = ({ children = null, innerDivClassName = "" }) => {
    return (
        <>
            <div className="relative flex h-screen items-center overflow-x-hidden">
                <div className={`flex h-full w-full ${innerDivClassName}`}>{children}</div>
            </div>
        </>
    );
};

export default BannerContainer;
