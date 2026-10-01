"use client";
import { useQuery } from "@tanstack/react-query";
import { LogOut as LogoutIcon, Coins as MoneyIcon, ShieldCheck as SecuredIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Dialog,
    DialogProps,
    Divider,
    Loading,
    Row,
    notify
} from "../../components/marathon/index.tsx";
import { ReactNode } from "../../components/marathon/index.tsx";
import { checkIsPaidImpl } from "../../helpers/PaymentHelper.ts";
import { clearSessionAsync } from "../../helpers/SessionHelper.ts";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { useNavigate } from "../../lib/navigation.ts";
import { isSuccessfulResponse, lxBackendUrl } from "../../requests/ApiConstants.ts";
import {
    StoredAccountEmail,
    StoredAuthEmail,
    StoredAuthToken,
    StoredAuthUserId,
    StoredAuthUserName
} from "../../requests/LxAuthRequests.ts";
import { getUserCurrentChannelAsync, revokeUserAccountAsync } from "../../requests/LxUserRequests.ts";
import Constants from "./../../helpers/Constants.ts";
import styles from "./UserHome.module.css";
import UserNotifications from "./UserNotifications.tsx";

async function getAccountEmailAsync() {
    const accountEmail = await getStorageItemAsync(StoredAccountEmail);
    if (accountEmail) return accountEmail;

    // Sessions created before ACCOUNT_EMAIL existed stored the account email in AUTH_EMAIL.
    const previousValue = await getStorageItemAsync(StoredAuthEmail);
    return previousValue?.includes("@") ? previousValue : null;
}

interface TipModel {
    icon: ReactNode;
    theme?: "success" | "info" | "warning" | "error";
    title: string;
    description: string;
}

function UserHome() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [userName, setUserName] = useState<string | null>();
    const [userEmail, setUserEmail] = useState<string | null>();
    const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
    const [avatarState, setAvatarState] = useState<"loading" | "loaded" | "error">("loading");
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteUserVisible, setIsDeleteUserVisible] = useState(false);

    useEffect(() => {
        async function getStoredUserInfoAsync() {
            const storedUserName = await getStorageItemAsync(StoredAuthUserName);
            const storedUserEmail = await getAccountEmailAsync();
            const storedUserId = await getStorageItemAsync(StoredAuthUserId);
            const avatarUrl = storedUserId
                ? `${lxBackendUrl}/Avatar/${encodeURIComponent(storedUserId)}?v=${Date.now()}`
                : null;

            setUserName(storedUserName);
            setUserEmail(storedUserEmail);
            setUserAvatarUrl(avatarUrl);
            if (!avatarUrl) setAvatarState("error");
        }

        getStoredUserInfoAsync().then();
    }, []);

    const tips: TipModel[] = [
        {
            icon: <SecuredIcon />,
            theme: "success",
            title: t("userHomeTip1Title"),
            description: t("userHomeTip1Description")
        },
        {
            icon: <MoneyIcon />,
            theme: "info",
            title: t("userHomeTip2Title"),
            description: t("userHomeTip2Description")
        }
    ];

    async function getUserChannelImplAsync() {
        const authToken = await getStorageItemAsync(StoredAuthToken);
        return await getUserCurrentChannelAsync(authToken ?? "");
    }

    const userInfo = useQuery({
        queryKey: ["userChannelInfo"],
        queryFn: () =>
            getUserChannelImplAsync().then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (r.status === 404) throw new Error(t("userInfoFetchFailedDescription"));
                if (!r.response) throw new Error(t("backendServerError"));

                const storedUserName = await getStorageItemAsync(StoredAuthUserName);
                const storedUserEmail = await getAccountEmailAsync();

                return [
                    {
                        title: t("username"),
                        value: storedUserName
                    },
                    {
                        title: t("email"),
                        value: storedUserEmail || t("noEmail")
                    },
                    {
                        title: t("userBranch"),
                        value: r.response.branch
                    },
                    {
                        title: t("userChannel"),
                        value: r.response.channel === 0 ? t("stable") : t("preview")
                    }
                ];
            })
    });

    if (userInfo.error) {
        notify
            .error({
                title: t("userInfoFetchFailed"),
                content: (userInfo.error as Error).message,
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                closeBtn: true,
                attach: () => document
            })
            .then(() => {});
    }

    async function logout() {
        setIsLoggingOut(true);
        await clearSessionAsync();

        await notify.info({
            title: t("loggedOut"),
            content: t("loggedOutDescription"),
            placement: "top-right",
            duration: 3000,
            offset: Constants.NotificationOffset,
            closeBtn: true,
            attach: () => document
        });

        navigate("/");
    }

    const handleClose: DialogProps["onClose"] = () => {
        setIsDeleteUserVisible(false);
    };

    const onConfirm: DialogProps["onConfirm"] = async () => {
        setIsDeleting(true);
        setIsDeleteUserVisible(false);

        const authToken = await getStorageItemAsync(StoredAuthToken);

        if (!authToken) {
            notify
                .error({
                    title: t("deleteAccountFailed"),
                    content: t("deleteAccountFailedDescription1"),
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                })
                .then(() => {});
            setIsDeleting(false);

            return;
        }

        const revokeResult = await revokeUserAccountAsync(authToken);

        if (!isSuccessfulResponse(revokeResult)) {
            notify
                .error({
                    title: t("deleteAccountFailed"),
                    content: t("deleteAccountFailedDescription2"),
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                })
                .then(() => {});
            setIsDeleting(false);

            return;
        }

        await logout();

        notify
            .success({
                title: t("deleteAccountSucceeded"),
                content: t("deleteAccountSucceededDescription"),
                placement: "top-right",
                duration: 3000,
                offset: Constants.NotificationOffset,
                closeBtn: true,
                attach: () => document
            })
            .then(() => {});

        setIsDeleting(false);
    };

    const isPaid = useQuery({
        queryKey: ["isPaid"],
        queryFn: () => checkIsPaidImpl()
    });

    return (
        <>
            <div>
                <div className={styles.profile}>
                    <div className={styles.avatarBlock}>
                        <div className={styles.avatar} aria-busy={avatarState === "loading"}>
                            {userAvatarUrl && (
                                <img
                                    src={userAvatarUrl}
                                    alt={t("userAvatar")}
                                    style={{ display: avatarState === "loaded" ? "block" : "none" }}
                                    onLoad={() => setAvatarState("loaded")}
                                    onError={() => setAvatarState("error")}
                                />
                            )}
                            {avatarState === "loading" && <Loading />}
                            {avatarState === "error" && <span>{t("avatarUnavailable")}</span>}
                        </div>
                        <Button variant="text" theme="primary" onClick={() => navigate("/user/avatar")}>
                            {t("changeAvatar")}
                        </Button>
                    </div>
                    <div className={styles.identity}>
                        <h5>{userName}</h5>
                        <span className={styles.email}>{userEmail || t("noEmail")}</span>
                        {isPaid.isLoading && <Loading />}
                        {isPaid.data && (
                            <Badge count={t("sponsorBadgeText")} shape="circle" size="medium" color="#FF5721" />
                        )}
                    </div>
                    <div className={styles.logout}>
                        <Button
                            theme="danger"
                            variant="outline"
                            icon={<LogoutIcon />}
                            loading={isLoggingOut}
                            onClick={logout}>
                            {t("logout")}
                        </Button>
                    </div>
                </div>

                <Divider align="center" layout="horizontal" />

                <Row gutter={40}>
                    <Col span={12} sm={12} md={8}>
                        {userInfo.isLoading && (
                            <div className="w-full place-items-center p-0 md:p-[24%]">
                                <Loading />
                            </div>
                        )}

                        {!userInfo.isLoading &&
                            userInfo.data &&
                            userInfo.data.length >= 0 &&
                            userInfo.data.map((userInfo, i) => (
                                <div key={i} className="mb-4">
                                    <Card title={userInfo.title} subtitle={userInfo.value} bordered headerBordered />
                                </div>
                            ))}

                        <Divider align="left" layout="horizontal" />

                        <div className="border-2 border-dashed rounded-none border-red-500 px-4 py-4 ">
                            <Alert
                                theme="error"
                                title={t("revokeCsAccountTitle")}
                                message={t("revokeCsAccountMessage")}
                            />

                            <div className="w-full place-content-end flex">
                                <div className="mt-4">
                                    <Button
                                        theme="danger"
                                        variant="base"
                                        onClick={() => setIsDeleteUserVisible(true)}
                                        loading={isDeleting}>
                                        {t("logoutAndDelete")}
                                    </Button>
                                </div>
                            </div>

                            <Dialog
                                theme="warning"
                                header={t("confirmDelete")}
                                visible={isDeleteUserVisible}
                                onConfirm={onConfirm}
                                onClose={handleClose}>
                                <p>{t("revokeCsAccountMessage")}</p>
                            </Dialog>
                        </div>
                    </Col>
                    <Col sm={12} md={4}>
                        <div className="mb-4">
                            <UserNotifications />
                        </div>
                        {tips.map((tip, i) => (
                            <div key={i} className="mb-4">
                                <Alert
                                    close
                                    icon={tip.icon}
                                    theme={tip.theme}
                                    message={
                                        <article>
                                            <p className="font-bold text-lg">{tip.title}</p>
                                            <p>{tip.description}</p>
                                        </article>
                                    }
                                />
                            </div>
                        ))}
                    </Col>
                </Row>
            </div>
        </>
    );
}

export default UserHome;
