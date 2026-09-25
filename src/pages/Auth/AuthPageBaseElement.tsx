import { lazy, useEffect } from "react";
import { Outlet, useMatches, useNavigate } from "react-router";

import { RouteHandle } from "../../app/routeTypes.ts";
import { useTheme } from "../../helpers/ThemeDetector.ts";
import i18next from "../../i18n.ts";

const t = i18next.t;

const ScrollVelocity = lazy(() => import("../../ReactBits/TextAnimations/ScrollVelocity/ScrollVelocity.tsx"));
const Iridescence = lazy(() => import("../../ReactBits/Backgrounds/Iridescence/Iridescence.tsx"));
const BannerContainer = lazy(() => import("../../components/BannerContainer.tsx"));

function AuthPageBaseElement() {
    const navigate = useNavigate();
    const theme = useTheme();

    const matches = useMatches();
    const currentMatch = matches[matches.length - 1];
    const handle = currentMatch?.handle as RouteHandle | undefined;
    const pageInfo = handle?.pageInfo?.(currentMatch?.loaderData);
    const iridescenceColor: [number, number, number] = theme === "dark" ? [0.2, 0.2, 0.2] : [0.8, 0.8, 0.8];
    const scrollVelocityTexts = pageInfo
        ? [`${pageInfo.pageKey} ${pageInfo.pageTitle}`, `Corona Studio ${t("corona_studio")}`]
        : [`Corona Studio ${t("corona_studio")}`];

    useEffect(() => {
        if (pageInfo?.pageKey === "Error") navigate("/", { replace: true });
    }, [navigate, pageInfo?.pageKey]);

    return (
        <>
            <BannerContainer>
                <div className="z-0 w-full h-full opacity-50">
                    <Iridescence color={iridescenceColor} mouseReact={false} amplitude={0.3} speed={0.5} />
                </div>

                <div className="z-10 absolute w-full h-full flex place-items-end pb-8 mix-blend-overlay">
                    <ScrollVelocity
                        texts={scrollVelocityTexts}
                        velocity={50}
                        velocityMapping={{ input: [0, 1000], output: [0, 0] }}
                        parallaxClassName="pb-4"
                    />
                </div>

                <div className="z-20 absolute w-full h-full flex justify-center overflow-clip ">
                    <div className="w-fit h-[60%] flex-center mt-32 overflow-clip scale-95 sm:scale-100 px-1">
                        <Outlet />
                    </div>
                </div>
            </BannerContainer>
        </>
    );
}

export default AuthPageBaseElement;
