import { t } from "i18next";
import { lazy } from "react";
import { ErrorResponse, useNavigate, useRouteError } from "react-router";
import { HomeIcon } from "tdesign-icons-react";
import { Button } from "tdesign-react";

const BannerContainer = lazy(() => import("../components/BannerContainer.tsx"));
const Threads = lazy(() => import("../ReactBits/Backgrounds/Threads/Threads.tsx"));

function ErrorBoundary() {
    const navigate = useNavigate();
    const error = useRouteError() as ErrorResponse;

    return (
        <>
            <BannerContainer innerDivClassName="bg-black">
                <div className="z-0 w-full h-full shadow">
                    <Threads amplitude={2} distance={0} enableMouseInteraction={false} />
                </div>

                <div className="z-10 absolute w-full h-full content-center place-items-center">
                    <div className="m-8 md:m-0 flex text-white">
                        <div className="m-auto space-y-8 border-2 border-dashed border-red-400 p-4 rounded-xl">
                            <article className="text-center text-pretty">
                                <p className="rounded-xl py-4 font-bold text-6xl md:text-8xl text-white bg-red-400">
                                    {error.status}
                                </p>
                                <p className="pt-4 text-xl md:text-4xl font-bold">{t("errorBoundaryTitle")}</p>
                                <p className="italic pb-4 md:text-lg text-zinc-500">{t("errorBoundarySubText")}</p>
                                <p className="text-red-400">{error.statusText}</p>
                                <p className="text-red-400">{error.data}</p>
                            </article>
                            <Button
                                className="w-full"
                                theme="danger"
                                size="large"
                                variant="base"
                                onClick={() => navigate("/")}>
                                <div className="flex items-center space-x-4">
                                    <HomeIcon />
                                    <span>{t("indexPage")}</span>
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </BannerContainer>
        </>
    );
}

export default ErrorBoundary;
