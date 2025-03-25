import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Delete1Icon } from "tdesign-icons-react";
import { Button, Card, Col, Empty, Loading, NotificationPlugin, Row } from "tdesign-react";

import { getStorageItemAsync } from "../../helpers/StorageHelper.ts";
import i18next from "../../i18n.ts";
import { StoredAuthToken } from "../../requests/LxAuthRequests.ts";
import { UserDeviceInfo, getUserAllDevicesAsync, removeDeviceAsync } from "../../requests/LxUserRequests.ts";

const t = i18next.t;

function UserDeviceManagement() {
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

    if (devices.error) {
        NotificationPlugin.error({
            title: t("userDeviceFetchFailed"),
            content: (devices.error as Error).message,
            placement: "top-right",
            duration: 3000,
            offset: [-36, "5rem"],
            closeBtn: true,
            attach: () => document
        }).then(() => {});
    }

    async function deleteDeviceAsync(device: UserDeviceInfo) {
        const authToken = await getStorageItemAsync(StoredAuthToken);

        if (!authToken) return;

        setIsLoading(true);
        removeDeviceAsync(device, authToken)
            .then(async (r) => {
                if (!r || !r.status) throw new Error(t("backendServerError"));
                if (r.status === 404) throw new Error(t("deviceRemoveFailedDescription"));

                await NotificationPlugin.success({
                    title: t("deviceRemoved"),
                    content: `${t("deviceRemoved")} - ${device.computerName}`,
                    placement: "top-right",
                    duration: 3000,
                    offset: [-36, "5rem"],
                    closeBtn: true,
                    attach: () => document
                });

                await devices.refetch();
            })
            .catch(async (error) => {
                await NotificationPlugin.error({
                    title: t("deviceRemoveFailed"),
                    content: (error as Error).message,
                    placement: "top-right",
                    duration: 3000,
                    offset: [-36, "5rem"],
                    closeBtn: true,
                    attach: () => document
                });
            })
            .finally(() => setIsLoading(false));
    }

    return (
        <>
            <div>
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

// Must Keep for ReactRouter
export const Component = () => UserDeviceManagement();
