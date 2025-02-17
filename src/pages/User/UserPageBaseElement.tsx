import { lazy, useEffect, useRef, useState } from "react";
import { Outlet, useMatches, useNavigate } from "react-router";

import { useMutationObserver } from "../../helpers/MutationObserverHelper.ts";
import i18next from "../../i18n.ts";
import IMatches from "../../interfaces/IMatches.ts";

const t = i18next.t;

const ScrollVelocity = lazy(() => import("../../ReactBits/TextAnimations/ScrollVelocity/ScrollVelocity.tsx"));
const Iridescence = lazy(() => import("../../ReactBits/Backgrounds/Iridescence/Iridescence.tsx"));
const BannerContainer = lazy(() => import("../../components/BannerContainer.tsx"));

interface PageInfo {
    pageKey: string;
    pageTitle: string;
}

interface HandleType {
    pageInfo: (param?: string) => PageInfo;
}

function UserPageBaseElement() {
    const docRef = useRef(document.documentElement);
    const [iridescenceColor, setIridescenceColor] = useState<[number, number, number]>([0, 0, 0]);

    const navigate = useNavigate();

    const matches = useMatches() as IMatches[];
    const { handle, data } = matches[matches.length - 1];

    const pageInfoHandle = !!handle && !!(handle as HandleType).pageInfo;
    const [scrollVelocityTexts, setScrollVelocityTexts] = useState([`Corona Studio ${t("corona_studio")}`]);

    useEffect(() => {
        const pageInfo = (handle as HandleType).pageInfo(data as string | undefined);

        if (pageInfo) {
            if (pageInfo.pageKey === "Error") {
                navigate("/");
                return;
            }

            document.title = pageInfo.pageTitle;
        }

        setIridescenceColor(docRef.current.getAttribute("theme-mode") ? [0.2, 0.2, 0.2] : [0.8, 0.8, 0.8]);
        setScrollVelocityTexts([`${pageInfo.pageKey} ${pageInfo.pageTitle}`, `Corona Studio ${t("corona_studio")}`]);
    }, [data, handle, navigate, pageInfoHandle]);

    function onThemeModeChanged(mutations: MutationRecord[]) {
        for (const mutation of mutations) {
            if (mutation.attributeName !== "theme-mode") continue;

            const value = docRef.current.getAttribute("theme-mode");
            const color: [number, number, number] = value === "dark" ? [0.2, 0.2, 0.2] : [0.8, 0.8, 0.8];

            setIridescenceColor(color);
        }
    }

    useMutationObserver(docRef, onThemeModeChanged, { attributes: true, attributeFilter: ["theme-mode"] });

    return (
        <>
            <BannerContainer>
                <div className="z-0 w-full h-full">
                    <Iridescence color={iridescenceColor} mouseReact={false} amplitude={0.1} speed={1.0} />
                </div>

                <div className="z-10 absolute w-full h-full flex place-items-end pb-8 mix-blend-overlay">
                    <ScrollVelocity
                        texts={scrollVelocityTexts}
                        velocity={50}
                        velocityMapping={{ input: [0, 1000], output: [0, 0] }}
                        parallaxClassName="pb-4"
                    />
                </div>

                <div className="z-20 absolute w-full h-full flex justify-center overflow-clip">
                    <div className="w-fit h-[60%] flex-center mt-32 overflow-clip">
                        <Outlet />
                    </div>
                </div>
            </BannerContainer>
        </>
    );
}

export default UserPageBaseElement;
