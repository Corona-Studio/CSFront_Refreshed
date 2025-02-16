import { Skeleton } from "tdesign-react";

import BannerContainer from "../components/BannerContainer.tsx";

function Fallback() {
    return (
        <>
            <BannerContainer>
                <div className="z-0 w-full h-full">
                    <div className="p-8 md:p-20 lg:p-40">
                        <Skeleton theme="article" animation="gradient" />
                    </div>
                </div>
            </BannerContainer>
        </>
    );
}

export default Fallback;
