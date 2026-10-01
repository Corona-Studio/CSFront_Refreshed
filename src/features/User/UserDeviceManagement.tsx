"use client";
import { useQuery } from "@tanstack/react-query";
import { Trash2 as Delete1Icon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Alert, Button, Card, Col, Empty, Loading, Row, notify } from "../../components/marathon/index.tsx";
import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import { isSuccessfulResponse } from "../../requests/ApiConstants.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import { UserDeviceInfo, getUserAllDevicesAsync, removeDeviceAsync } from "../../requests/LxUserRequests.ts";
import Constants from "./../../helpers/Constants.ts";

function UserDeviceManagement() {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    async function getUserAllDevicesImplAsync() {
        const authToken = await getStorageItemAsync(StoredAuthToken);
        return await getUserAllDevicesAsync(authToken ?? "");
    }

    const devices = useQuery({
        queryKey: ["userDeviceList"],
        queryFn: () =>
            getUserAllDevicesImplAsync().then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (r.status === 404) throw new Error(t("userDeviceFetchFailedDescription"));
                if (!r.response) throw new Error(t("backendServerError"));

                return r.response;
            })
    });

    async function deleteDeviceAsync(device: UserDeviceInfo) {
        const authToken = await getStorageItemAsync(StoredAuthToken);

        if (!authToken) return;

        setIsLoading(true);
        removeDeviceAsync(device, authToken)
            .then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (r.status === 404) throw new Error(t("deviceRemoveFailedDescription"));
                if (!isSuccessfulResponse(r)) throw new Error(t("backendServerError"));

                await notify.success({
                    title: t("deviceRemoved"),
                    content: `${t("deviceRemoved")} - ${device.computerName}`,
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });

                await devices.refetch();
            })
            .catch(async (error) => {
                await notify.error({
                    title: t("deviceRemoveFailed"),
                    content: (error as Error).message,
                    placement: "top-right",
                    duration: 3000,
                    offset: Constants.NotificationOffset,
                    closeBtn: true,
                    attach: () => document
                });
            })
            .finally(() => setIsLoading(false));
    }

    return (
        <>
            <div>
                {devices.error && (
                    <Alert
                        theme="error"
                        message={(devices.error as Error).message}
                        operation={
                            <Button variant="outline" onClick={() => void devices.refetch()}>
                                {t("retry")}
                            </Button>
                        }
                    />
                )}
                <Row gutter={[8, 8]}>
                    {devices.data &&
                        devices.data.length > 0 &&
                        devices.data.map((device, i) => (
                            <Col key={i} sm={12} md={6} lg={4}>
                                <Card
                                    title={device.computerName}
                                    actions={
                                        <Button
                                            disabled={isLoading}
                                            theme="danger"
                                            shape="square"
                                            variant="base"
                                            icon={<Delete1Icon />}
                                            aria-label={`${t("deviceManage")}: ${device.computerName}`}
                                            onClick={async () => await deleteDeviceAsync(device)}
                                        />
                                    }
                                    bordered
                                    headerBordered>
                                    <article className="truncate">
                                        <p>
                                            {t("deviceId")} - {device.id}
                                        </p>
                                        <p>
                                            {t("serialNumber")} - {device.mac}
                                        </p>
                                    </article>
                                </Card>
                            </Col>
                        ))}
                    {devices.isLoading && <Loading />}
                    {!devices.isLoading && (!devices.data || devices.data.length === 0) && (
                        <Col span={12}>
                            <Empty />
                        </Col>
                    )}
                </Row>
            </div>
        </>
    );
}

export const Component = () => UserDeviceManagement();
