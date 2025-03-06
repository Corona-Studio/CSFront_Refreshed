import { FC, ReactNode } from "react";

interface PaperProps {
    children?: ReactNode;
    innerDivClassName?: string;
}

const BannerContainer: FC<PaperProps> = ({ children = null, innerDivClassName = "" }) => {
    return (
        <>
            <div className="flex h-screen relative overflow-x-hidden items-center">
                <div className={`flex w-full h-full ${innerDivClassName}`}>{children}</div>
            </div>
        </>
    );
};

export default BannerContainer;
