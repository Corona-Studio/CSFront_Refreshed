import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { MoneyIcon, SecuredIcon } from "tdesign-icons-react";
import { Alert, Avatar, Button, Card, Col, Divider, Loading, NotificationPlugin, Row } from "tdesign-react";
import { TElement } from "tdesign-react/lib/common";

import { getStorageItem } from "../../helpers/StorageHelper.ts";
import i18next from "../../i18n.ts";
import { lxBackendUrl } from "../../requests/ApiConstants.ts";
import {
    StoredAuthEmail,
    StoredAuthExpired,
    StoredAuthPassword,
    StoredAuthToken,
    StoredAuthUserId,
    StoredAuthUserName
} from "../../requests/LxAuthRequests.ts";
import { getUserCurrentChannelAsync } from "../../requests/LxUserRequests.ts";

const t = i18next.t;

interface TipModel {
    icon: TElement;
    theme?: "success" | "info" | "warning" | "error";
    title: string;
    description: string;
}

function UserHome() {
    const navigate = useNavigate();

    const authToken = getStorageItem(StoredAuthToken);
    const userId = getStorageItem(StoredAuthUserId);

    const [userName] = useState(getStorageItem(StoredAuthUserName));
    const [userEmail] = useState(getStorageItem(StoredAuthEmail));
    const [userAvatarUrl] = useState(
        userId ? `${lxBackendUrl}/Avatar/${userId}` : "https://tdesign.gtimg.com/site/avatar.jpg"
    );

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

    const userInfo = useQuery({
        queryKey: ["userChannelInfo"],
        queryFn: () =>
            getUserCurrentChannelAsync(authToken ?? "").then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (r.status === 404) throw new Error(t("userInfoFetchFailedDescription"));
                if (!r.response) throw new Error(t("backendServerError"));

                return [
                    {
                        title: t("username"),
                        value: userName
                    },
                    {
                        title: t("email"),
                        value: userEmail
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
        NotificationPlugin.error({
            title: t("userInfoFetchFailed"),
            content: (userInfo.error as Error).message,
            placement: "top-right",
            duration: 3000,
            offset: [-36, "5rem"],
            closeBtn: true,
            attach: () => document
        }).then(() => {});
    }

    async function logout() {
        localStorage.setItem(StoredAuthEmail, "");
        localStorage.setItem(StoredAuthPassword, "");
        localStorage.setItem(StoredAuthToken, "");
        localStorage.setItem(StoredAuthExpired, "");
        localStorage.setItem(StoredAuthUserName, "");
        localStorage.setItem(StoredAuthUserId, "");

        sessionStorage.setItem(StoredAuthEmail, "");
        sessionStorage.setItem(StoredAuthPassword, "");
        sessionStorage.setItem(StoredAuthToken, "");
        sessionStorage.setItem(StoredAuthExpired, "");
        sessionStorage.setItem(StoredAuthUserName, "");
        sessionStorage.setItem(StoredAuthUserId, "");

        await NotificationPlugin.info({
            title: t("loggedOut"),
            content: t("loggedOutDescription"),
            placement: "top-right",
            duration: 3000,
            offset: [-36, "5rem"],
            closeBtn: true,
            attach: () => document
        });

        console.log("User logged out...");
        navigate("/");
    }

    return (
        <>
            <div>
                <Row align="middle" gutter={12}>
                    <Col>
                        <Avatar image={userAvatarUrl} shape="round" size="120px" />
                    </Col>
                    <Col>
                        <Col>
                            <h5>{userName}</h5>
                        </Col>
                        <Col>
                            <span>{userEmail}</span>
                        </Col>
                        <Col>
                            <Button onClick={logout}>{t("logout")}</Button>
                        </Col>
                    </Col>
                </Row>

                <Divider align="center" layout="horizontal" />

                <Row gutter={40}>
                    <Col sm={12} md={8}>
                        {userInfo.isLoading && (
                            <div className="w-full place-items-center p-0 md:p-[24%]">
                                <Loading />
                            </div>
                        )}

                        {!userInfo.isLoading &&
                            userInfo.data?.map((userInfo, i) => (
                                <div key={i} className="mb-4">
                                    <Card title={userInfo.title} subtitle={userInfo.value} bordered headerBordered />
                                </div>
                            ))}
                    </Col>
                    <Col sm={12} md={4}>
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
