import i18next from "i18next";
import { lazy } from "react";
import { Route, createBrowserRouter, createRoutesFromElements, ScrollRestoration } from "react-router";

import { isAdminSessionValidAsync, isUserSessionValidAsync } from "./helpers/SessionHelper.ts";
import { adminPageMenuLinks } from "./pages/Admin/AdminPageMenuLinks.tsx";
import { userPageMenuLinks } from "./pages/User/UserPageMenuLinks.tsx";
import StaticEvent from "./pages/StaticEvent.tsx";

const AdminHome = lazy(() => import("./pages/Admin/AdminHome.tsx"));

const App = lazy(() => import("./App.tsx"));
const Fallback = lazy(() => import("./pages/Fallback.tsx"));
const Home = lazy(() => import("./pages/Home.tsx"));
const LxIndex = lazy(() => import("./pages/LauncherX/LxHome.tsx"));
const CMFS = lazy(() => import("./pages/CMFS.tsx"));
const UserHome = lazy(() => import("./pages/User/UserHome.tsx"));

const ErrorBoundary = lazy(() => import("./pages/ErrorBoundary.tsx"));
const AuthPageBaseElement = lazy(() => import("./pages/Auth/AuthPageBaseElement.tsx"));
const ManagementPageBaseElement = lazy(() => import("./pages/ManagementPageBaseElement.tsx"));

const t = i18next.t;

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<><ScrollRestoration /><App /></>} hydrateFallbackElement={<Fallback />} errorElement={<ErrorBoundary />}>
            <Route index element={<Home />} handle={{ title: () => "Corona Studio" }} />
            <Route handle={{ title: () => `Corona Studio Event` }} path="events-static" element={<StaticEvent />} >
                <Route handle={{ title: () => `Corona Studio Event` }} path=":path" />
            </Route>
            <Route path="lx">
                <Route index element={<LxIndex />} handle={{ title: () => "LauncherX" }} />
                <Route
                    path="download"
                    handle={{ title: () => `LauncherX - ${t("download")}` }}
                    lazy={() => import("./pages/LauncherX/LxDownload.tsx")}
                />
                <Route
                    path="download/thanks"
                    handle={{ title: () => `${t("downloadThanks")} - LauncherX` }}
                    lazy={() => import("./pages/LauncherX/LxDownloadThanks.tsx")}
                />
            </Route>
            <Route
                path="launcherx/download"
                handle={{ title: () => `LauncherX - ${t("download")}` }}
                lazy={() => import("./pages/LauncherX/LxDownload.tsx")}
            />
            <Route path="cmfs" element={<CMFS />} handle={{ title: () => "CMFS" }} />
            <Route
                path="auth"
                element={<AuthPageBaseElement />}
                handle={{ title: () => "Error", pageInfo: () => ({ pageKey: "Error", pageTitle: "Error" }) }}>
                <Route
                    path="login"
                    handle={{ title: () => t("login"), pageInfo: () => ({ pageKey: "Login", pageTitle: t("login") }) }}
                    lazy={() => import("./pages/Auth/AuthLogin.tsx")}
                />
                <Route
                    path="register"
                    handle={{
                        title: () => t("register"),
                        pageInfo: () => ({ pageKey: "Register", pageTitle: t("register") })
                    }}
                    lazy={() => import("./pages/Auth/AuthRegister.tsx")}
                />
                <Route
                    path="forgetPassword"
                    handle={{
                        title: () => t("forgetPassword"),
                        pageInfo: () => ({ pageKey: "ForgetPassword", pageTitle: t("forgetPassword") })
                    }}
                    lazy={() => import("./pages/Auth/AuthForgetPassword.tsx")}
                />
                <Route
                    path="resetPassword"
                    handle={{
                        title: () => t("resetPassword"),
                        pageInfo: () => ({ pageKey: "ResetPassword", pageTitle: t("resetPassword") })
                    }}
                    lazy={() => import("./pages/Auth/AuthResetPassword.tsx")}
                />
                <Route
                    path="confirmEmail"
                    handle={{
                        title: () => t("confirmEmail"),
                        pageInfo: () => ({ pageKey: "ConfirmEmail", pageTitle: t("confirmEmail") })
                    }}
                    lazy={() => import("./pages/Auth/AuthConfirmEmail.tsx")}
                />
            </Route>
            <Route
                path="user"
                element={
                    <ManagementPageBaseElement
                        links={userPageMenuLinks}
                        userSessionValidation={true}
                        userSessionValidator={isUserSessionValidAsync}
                        invalidJumpPage="/auth/login"
                    />
                }
                handle={{ title: () => "Error", pageInfo: () => ({ pageKey: "Error", pageTitle: "Error" }) }}>
                <Route index element={<UserHome />} handle={{ title: () => t("userCenter") }} />
                <Route
                    path="device"
                    handle={{ title: () => t("deviceManage") }}
                    lazy={() => import("./pages/User/UserDeviceManagement.tsx")}
                />
                <Route
                    path="sponsor"
                    handle={{ title: () => t("sponsor") }}
                    lazy={() => import("./pages/User/UserSponsor.tsx")}
                />
            </Route>
            <Route
                path="admin"
                element={
                    <ManagementPageBaseElement
                        links={adminPageMenuLinks}
                        userSessionValidation={true}
                        userSessionValidator={async () => await isAdminSessionValidAsync(true)}
                        invalidJumpPage="/"
                    />
                }
                handle={{ title: () => "Error", pageInfo: () => ({ pageKey: "Error", pageTitle: "Error" }) }}>
                <Route index element={<AdminHome />} handle={{ title: () => t("adminCenter") }} />
                <Route
                    path="sponsor"
                    handle={{ title: () => t("sponsorAdmin") }}
                    lazy={() => import("./pages/Admin/AdminSponsor.tsx")}
                />
            </Route>
        </Route>
    )
);
